using Application.AfterSales.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Commands;

public sealed class SubmitTicket
{
    public sealed class Command : IRequest<Result<TicketDetailDto>>
    {
        public required SubmitTicketDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<TicketDetailDto>>
    {
        public async Task<Result<TicketDetailDto>> Handle(Command request, CancellationToken ct)
        {
            Guid userId = userAccessor.GetUserId();

            // 1. Load the order — must belong to this customer and be in a delivered/completed state
            Order? order = await context.Orders
                .AsNoTracking()
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o =>
                    o.Id == request.Dto.OrderId &&
                    o.UserId == userId &&
                    (o.OrderStatus == OrderStatus.Delivered || o.OrderStatus == OrderStatus.Completed), ct);

            if (order == null)
                return Result<TicketDetailDto>.Failure(
                    "Order not found or is not eligible for after-sales request.", 404);

            // 2. Determine OrderItemIds to create tickets for
            List<Guid?> orderItemIdsToProcess = [];
            
            if (request.Dto.OrderItemIds == null || request.Dto.OrderItemIds.Count == 0)
            {
                // No specific items selected — create one ticket for the whole order
                orderItemIdsToProcess.Add(null);
            }
            else
            {
                // Validate all selected items belong to the order
                HashSet<Guid> validItemIds = order.OrderItems.Select(i => i.Id).ToHashSet();
                foreach (Guid itemId in request.Dto.OrderItemIds)
                {
                    if (!validItemIds.Contains(itemId))
                        return Result<TicketDetailDto>.Failure(
                            $"Item '{itemId}' does not belong to this order.", 400);
                }
                orderItemIdsToProcess = request.Dto.OrderItemIds.Cast<Guid?>().ToList();
            }

            // 3. Load active policy — map TicketType to PolicyType explicitly
            PolicyType policyType = request.Dto.TicketType switch
            {
                AfterSalesTicketType.Return => PolicyType.Return,
                AfterSalesTicketType.Warranty => PolicyType.Warranty,
                AfterSalesTicketType.Refund => PolicyType.Refund,
                _ => PolicyType.Unknown
            };

            if (policyType == PolicyType.Unknown)
                return Result<TicketDetailDto>.Failure("Invalid ticket type specified.", 400);

            PolicyConfiguration? policy = await context.PolicyConfigurations
                .AsNoTracking()
                .FirstOrDefaultAsync(p =>
                    p.PolicyType == policyType &&
                    p.IsActive &&
                    !p.IsDeleted &&
                    p.EffectiveFrom <= DateTime.UtcNow &&
                    (p.EffectiveTo == null || p.EffectiveTo >= DateTime.UtcNow), ct);

            if (policy == null)
                return Result<TicketDetailDto>.Failure(
                    "This after-sales service is currently unavailable. Please contact support.", 503);

            // 4. Resolve the delivered date from status history to enforce policy windows
            DateTime? deliveredAt = await context.OrderStatusHistories
                .AsNoTracking()
                .Where(h => h.OrderId == order.Id && h.ToStatus == OrderStatus.Delivered)
                .OrderByDescending(h => h.CreatedAt)
                .Select(h => (DateTime?)h.CreatedAt)
                .FirstOrDefaultAsync(ct);

            // 5. Policy pre-checks — auto-reject with PolicyViolation message
            string? policyViolation = null;

            if (request.Dto.TicketType == AfterSalesTicketType.Return)
            {
                if (deliveredAt == null)
                    policyViolation = "Order delivery date could not be verified.";
                else if (policy.ReturnWindowDays.HasValue &&
                         (DateTime.UtcNow - deliveredAt.Value).TotalDays > policy.ReturnWindowDays.Value)
                    policyViolation =
                        $"Return window of {policy.ReturnWindowDays} day(s) has expired.";
            }
            else if (request.Dto.TicketType == AfterSalesTicketType.Warranty)
            {
                if (deliveredAt == null)
                    policyViolation = "Order delivery date could not be verified.";
                else if (policy.WarrantyMonths.HasValue &&
                         DateTime.UtcNow > deliveredAt.Value.AddMonths(policy.WarrantyMonths.Value))
                    policyViolation =
                        $"Warranty period of {policy.WarrantyMonths} month(s) has expired.";
            }
            else if (request.Dto.TicketType == AfterSalesTicketType.Refund)
            {
                if (!policy.RefundAllowed)
                    policyViolation = "Refunds are not allowed under the current policy.";
                else if (!policy.CustomizedLensRefundable &&
                         order.OrderType == OrderType.Prescription)
                    policyViolation =
                        "Customized prescription lenses are non-refundable under the current policy.";
            }

            // 6. Duplicate open ticket check (same order + same item + original/effective Return OR any Refund, not closed/rejected/resolved)
            //    - Blocks if: (TicketType == Return || OriginalTicketType == Return || TicketType == Refund)
            //    - This ensures you can't have both an open Refund and an open Return for the same scope.
            bool duplicateExists = await context.AfterSalesTickets
                .AsNoTracking()
                .AnyAsync(t =>
                    t.OrderId == request.Dto.OrderId &&
                    (request.Dto.OrderItemIds == null || request.Dto.OrderItemIds.Count == 0 
                        ? t.OrderItemId == null 
                        : request.Dto.OrderItemIds.Contains(t.OrderItemId ?? Guid.Empty)) &&
                    (
                        t.TicketType == request.Dto.TicketType ||
                        t.OriginalTicketType == request.Dto.TicketType ||
                        (request.Dto.TicketType == AfterSalesTicketType.Return && t.TicketType == AfterSalesTicketType.Refund) ||
                        (request.Dto.TicketType == AfterSalesTicketType.Refund && t.TicketType == AfterSalesTicketType.Return)
                    ) &&
                    t.TicketStatus != AfterSalesTicketStatus.Rejected &&
                    t.TicketStatus != AfterSalesTicketStatus.Resolved &&
                    t.TicketStatus != AfterSalesTicketStatus.Closed, ct);

            if (duplicateExists)
                return Result<TicketDetailDto>.Failure(
                    "An open ticket of this type already exists for this order item.", 409);

            // 7. Halt and return 400 if policy violation occurs
            if (policyViolation != null)
                return Result<TicketDetailDto>.Failure(policyViolation, 400);

            // 7.5. Auto-upgrade Return → Refund (RefundOnly fast-track) if all conditions are met:
            //   A. No existing Refund ticket on this order (any status)
            //   B. Delivered within Refund policy's RefundWindowDays
            //   C. Item value ≤ Refund policy's RefundOnlyMaxAmount
            //   D. Prescription lenses are refundable per Refund policy
            AfterSalesTicketType effectiveType = request.Dto.TicketType;
            AfterSalesTicketType? originalTicketType = null;
            PolicyConfiguration? appliedRefundPolicy = null;

            if (request.Dto.TicketType == AfterSalesTicketType.Return)
            {
                PolicyConfiguration? refundPolicy = await context.PolicyConfigurations
                    .AsNoTracking()
                    .Where(p =>
                        p.PolicyType == PolicyType.Refund &&
                        p.IsActive &&
                        !p.IsDeleted &&
                        p.EffectiveFrom <= DateTime.UtcNow &&
                        (p.EffectiveTo == null || p.EffectiveTo >= DateTime.UtcNow))
                    .OrderByDescending(p => p.EffectiveFrom)
                    .ThenByDescending(p => p.UpdatedAt)
                    .FirstOrDefaultAsync(ct);

                if (refundPolicy != null && refundPolicy.RefundAllowed)
                {
                    // Check A: no existing Refund ticket on this order (any status)
                    bool hasExistingRefundTicket = await context.AfterSalesTickets
                        .AsNoTracking()
                        .AnyAsync(t =>
                            t.OrderId == request.Dto.OrderId &&
                            t.TicketType == AfterSalesTicketType.Refund, ct);

                    if (!hasExistingRefundTicket)
                    {
                        // Check B: delivered within RefundWindowDays
                        bool withinRefundWindow = !refundPolicy.RefundWindowDays.HasValue ||
                            (deliveredAt.HasValue &&
                             (DateTime.UtcNow - deliveredAt.Value).TotalDays <= refundPolicy.RefundWindowDays.Value);

                        if (withinRefundWindow)
                        {
                            // Compute item value for the ticket's scope
                            decimal itemValue = request.Dto.OrderItemId.HasValue
                                ? order.OrderItems
                                    .Where(i => i.Id == request.Dto.OrderItemId.Value)
                                    .Sum(i => i.UnitPrice * i.Quantity)
                                : order.OrderItems.Sum(i => i.UnitPrice * i.Quantity);

                            // Check C: item value within auto-upgrade threshold
                            bool withinMaxAmount = !refundPolicy.RefundOnlyMaxAmount.HasValue ||
                                itemValue <= refundPolicy.RefundOnlyMaxAmount.Value;

                            if (withinMaxAmount)
                            {
                                // Check D: prescription lenses must be refundable per Refund policy
                                bool prescriptionOk = refundPolicy.CustomizedLensRefundable ||
                                    order.OrderType != OrderType.Prescription;

                                if (prescriptionOk)
                                {
                                    effectiveType = AfterSalesTicketType.Refund;
                                    originalTicketType = AfterSalesTicketType.Return;
                                    appliedRefundPolicy = refundPolicy;
                                }
                            }
                        }
                    }
                }
            }

            // 8. Create tickets for each selected item
            List<TicketAttachmentInputDto> attachments = request.Dto.Attachments ?? [];
            AfterSalesTicket? lastCreatedTicket = null;

            foreach (Guid? orderItemId in orderItemIdsToProcess)
            {
                // Build ticket entity with effective type from auto-upgrade logic
                AfterSalesTicket ticket = new()
                {
                    OrderId = request.Dto.OrderId,
                    OrderItemId = orderItemId,
                    CustomerId = userId,
                    TicketType = effectiveType,
                    OriginalTicketType = originalTicketType,
                    Reason = request.Dto.Reason,
                    RequestedAction = string.IsNullOrWhiteSpace(request.Dto.RequestedAction)
                        ? null
                        : request.Dto.RequestedAction,
                    RefundAmount = request.Dto.RefundAmount,
                    IsRequiredEvidence = (appliedRefundPolicy ?? policy).EvidenceRequired,
                    PolicyViolation = null,
                    TicketStatus = AfterSalesTicketStatus.Pending
                };

                // Attach evidence files
                foreach (TicketAttachmentInputDto attachment in attachments)
                {
                    ticket.Attachments.Add(new TicketAttachment
                    {
                        TicketId = ticket.Id,
                        FileName = attachment.FileName,
                        FileUrl = attachment.FileUrl,
                        FileExtension = string.IsNullOrWhiteSpace(attachment.FileExtension)
                            ? null
                            : attachment.FileExtension
                    });
                }

                context.AfterSalesTickets.Add(ticket);
                lastCreatedTicket = ticket;
            }

            bool isSuccess = await context.SaveChangesAsync(ct) > 0;

            if (!isSuccess)
                return Result<TicketDetailDto>.Failure("Failed to submit after-sales ticket.", 500);

            // 7. Return full detail of last created ticket via projection
            if (lastCreatedTicket == null)
                return Result<TicketDetailDto>.Failure("Failed to create ticket.", 500);

            TicketDetailDto? dto = await context.AfterSalesTickets
                .AsNoTracking()
                .Where(t => t.Id == lastCreatedTicket.Id)
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<TicketDetailDto>.Failure("Failed to retrieve created ticket.", 500);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

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
        public async Task<Result<TicketDetailDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            // 1. Load the order — must belong to this customer and be in a delivered/completed state
            Order? order = await context.Orders
                .AsNoTracking()
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o =>
                    o.Id == request.Dto.OrderId &&
                    o.UserId == userId &&
                    (o.OrderStatus == OrderStatus.Delivered || o.OrderStatus == OrderStatus.Completed), cancellationToken);

            if (order == null)
                return Result<TicketDetailDto>.Failure(
                    "Order not found or is not eligible for support requests. After-sales tickets can only be created for delivered orders.", 404);

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
                            "One or more selected items do not belong to this order. Please refresh the page and try again.", 400);
                }
                List<Guid> distinctItemIds = request.Dto.OrderItemIds.Distinct().ToList();
                if (distinctItemIds.Count != request.Dto.OrderItemIds.Count)
                    return Result<TicketDetailDto>.Failure(
                        "Each selected item must be unique.", 400);

                orderItemIdsToProcess = distinctItemIds.Cast<Guid?>().ToList();
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
                    (p.EffectiveTo == null || p.EffectiveTo >= DateTime.UtcNow), cancellationToken);

            if (policy == null)
                return Result<TicketDetailDto>.Failure(
                    "This support service is temporarily unavailable. Please try again later or contact our support team.", 503);

            // 4. Resolve the delivered date from status history to enforce policy windows
            DateTime? deliveredAt = await context.OrderStatusHistories
                .AsNoTracking()
                .Where(h => h.OrderId == order.Id && h.ToStatus == OrderStatus.Delivered)
                .OrderByDescending(h => h.CreatedAt)
                .Select(h => (DateTime?)h.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

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
            AfterSalesTicket? existingTicket = await context.AfterSalesTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t =>
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
                    t.TicketStatus != AfterSalesTicketStatus.Closed, cancellationToken);

            if (existingTicket != null)
            {
                string existingType = existingTicket.OriginalTicketType?.ToString() ?? existingTicket.TicketType.ToString();
                string ticketScope = request.Dto.OrderItemIds?.Count > 0 ? "this item" : "this order";
                return Result<TicketDetailDto>.Failure(
                    $"You already have an open {existingType} request for {ticketScope}. Our team is reviewing it. Please check your support tickets section for details.", 409);
            }

            // 6.5. Check if any selected items are already covered by existing non-closed tickets
            // This includes:
            //   (a) whole-order tickets (OrderItemId == null) — they implicitly cover every item
            //   (b) item-specific tickets that overlap with the selected items
            if (request.Dto.OrderItemIds != null && request.Dto.OrderItemIds.Count > 0)
            {
                // (a) Block if a whole-order ticket exists — it already covers all items
                bool wholeOrderTicketExists = await context.AfterSalesTickets
                    .AsNoTracking()
                    .AnyAsync(t =>
                        t.OrderId == request.Dto.OrderId &&
                        t.OrderItemId == null &&
                        t.TicketStatus != AfterSalesTicketStatus.Rejected &&
                        t.TicketStatus != AfterSalesTicketStatus.Resolved &&
                        t.TicketStatus != AfterSalesTicketStatus.Closed, cancellationToken);

                if (wholeOrderTicketExists)
                    return Result<TicketDetailDto>.Failure(
                        "You already have an open request covering the entire order. You cannot submit item-specific requests while it is active. Please check your support tickets section for details.", 409);

                // (b) Block if any of the selected items are already in an item-specific ticket
                List<Guid> itemsInExistingTickets = await context.AfterSalesTickets
                    .AsNoTracking()
                    .Where(t =>
                        t.OrderId == request.Dto.OrderId &&
                        t.OrderItemId.HasValue &&
                        request.Dto.OrderItemIds.Contains(t.OrderItemId.Value) &&
                        t.TicketStatus != AfterSalesTicketStatus.Rejected &&
                        t.TicketStatus != AfterSalesTicketStatus.Resolved &&
                        t.TicketStatus != AfterSalesTicketStatus.Closed)
                    .Select(t => t.OrderItemId!.Value)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                if (itemsInExistingTickets.Count > 0)
                {
                    // Get product names for the items already in tickets
                    List<string> productNames = await context.OrderItems
                        .AsNoTracking()
                        .Where(oi => itemsInExistingTickets.Contains(oi.Id))
                        .Select(oi => oi.ProductVariant.Product.ProductName)
                        .ToListAsync(cancellationToken);

                    string productsText = string.Join(", ", productNames);
                    return Result<TicketDetailDto>.Failure(
                        $"One or more products you selected are already included in another ticket: {productsText}. You can only have one open ticket per product. Please select different items or check your existing tickets.", 409);
                }
            }

            // 7. Halt and return 400 if policy violation occurs
            if (policyViolation != null)
                return Result<TicketDetailDto>.Failure(
                    $"Cannot submit request: {policyViolation} Please contact support if you believe this is an error.", 400);

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
                    .FirstOrDefaultAsync(cancellationToken);

                if (refundPolicy != null && refundPolicy.RefundAllowed)
                {
                    // Check A: no existing Refund ticket on this order (any status)
                    bool hasExistingRefundTicket = await context.AfterSalesTickets
                        .AsNoTracking()
                        .AnyAsync(t =>
                            t.OrderId == request.Dto.OrderId &&
                            t.TicketType == AfterSalesTicketType.Refund, cancellationToken);

                    if (!hasExistingRefundTicket)
                    {
                        // Check B: delivered within RefundWindowDays
                        bool withinRefundWindow = !refundPolicy.RefundWindowDays.HasValue ||
                            (deliveredAt.HasValue &&
                             (DateTime.UtcNow - deliveredAt.Value).TotalDays <= refundPolicy.RefundWindowDays.Value);

                        if (withinRefundWindow)
                        {
                            // Compute item value for the ticket's scope
                            decimal itemValue = request.Dto.OrderItemIds?.Count > 0
                                ? order.OrderItems
                                    .Where(i => request.Dto.OrderItemIds.Contains(i.Id))
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

            bool isSuccess = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!isSuccess)
                return Result<TicketDetailDto>.Failure(
                    "Failed to submit your support request. Please try again or contact support for assistance.", 500);

            // 7. Return full detail of last created ticket via projection
            if (lastCreatedTicket == null)
                return Result<TicketDetailDto>.Failure(
                    "Failed to process your request. Please try again.", 500);

            TicketDetailDto? dto = await context.AfterSalesTickets
                .AsNoTracking()
                .Where(t => t.Id == lastCreatedTicket.Id)
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (dto == null)
                return Result<TicketDetailDto>.Failure(
                    "Your request was submitted but we could not load the details. Please check your support tickets section.", 500);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

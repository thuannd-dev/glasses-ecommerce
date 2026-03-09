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

            // 2. Validate OrderItemIds belong to the order
            List<Guid> itemIdsToProcess = request.Dto.OrderItemIds ?? [];
            if (itemIdsToProcess.Count == 0)
                return Result<TicketDetailDto>.Failure(
                    "Please select at least one item for the ticket.", 400);

            List<Guid> validItemIds = order.OrderItems.Select(i => i.Id).ToList();
            List<Guid> invalidIds = itemIdsToProcess.Where(id => !validItemIds.Contains(id)).ToList();
            if (invalidIds.Count > 0)
                return Result<TicketDetailDto>.Failure(
                    "One or more specified order items do not belong to this order.", 400);

            // 3. Load active policy — map TicketType to PolicyType explicitly to avoid enum divergence issues
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
                    p.EffectiveFrom <= TimezoneHelper.GetVietnamNow() &&
                    (p.EffectiveTo == null || p.EffectiveTo >= TimezoneHelper.GetVietnamNow()), ct);

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
                         (TimezoneHelper.GetVietnamNow() - deliveredAt.Value).TotalDays > policy.ReturnWindowDays.Value)
                    policyViolation =
                        $"Return window of {policy.ReturnWindowDays} day(s) has expired.";
            }
            else if (request.Dto.TicketType == AfterSalesTicketType.Warranty)
            {
                if (deliveredAt == null)
                    policyViolation = "Order delivery date could not be verified.";
                else if (policy.WarrantyMonths.HasValue &&
                         TimezoneHelper.GetVietnamNow() > deliveredAt.Value.AddMonths(policy.WarrantyMonths.Value))
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

            // Halt and Return 400 if Policy Violation occurs
            if (policyViolation != null)
            {
                return Result<TicketDetailDto>.Failure(policyViolation, 400);
            }

            // 6. Determine which items to create tickets for
            // Items are always required now, so create one ticket per selected item
            List<Guid> itemsToTicket = itemIdsToProcess;

            // 7. Check for duplicates and create tickets
            AfterSalesTicket? firstTicket = null;
            foreach (Guid itemId in itemsToTicket)
            {
                // Duplicate open ticket check (same order + same item + same type, not closed/rejected/resolved/cancelled)
                bool duplicateExists = await context.AfterSalesTickets
                    .AsNoTracking()
                    .AnyAsync(t =>
                        t.OrderId == request.Dto.OrderId &&
                        t.OrderItemId == itemId &&
                        t.TicketType == request.Dto.TicketType &&
                        t.TicketStatus != AfterSalesTicketStatus.Rejected &&
                        t.TicketStatus != AfterSalesTicketStatus.Resolved &&
                        t.TicketStatus != AfterSalesTicketStatus.Closed &&
                        t.TicketStatus != AfterSalesTicketStatus.Cancelled, ct);

                if (duplicateExists)
                    return Result<TicketDetailDto>.Failure(
                        $"An open ticket of this type already exists for this order item.", 409);

                // Build ticket entity
                AfterSalesTicket ticket = new()
                {
                    OrderId = request.Dto.OrderId,
                    OrderItemId = itemId,
                    CustomerId = userId,
                    TicketType = request.Dto.TicketType,
                    Reason = request.Dto.Reason,
                    RequestedAction = string.IsNullOrWhiteSpace(request.Dto.RequestedAction)
                        ? null
                        : request.Dto.RequestedAction,
                    RefundAmount = request.Dto.RefundAmount,
                    IsRequiredEvidence = policy.EvidenceRequired,
                    PolicyViolation = null,
                    TicketStatus = AfterSalesTicketStatus.Pending
                };

                // Attach evidence files (same attachments for each ticket)
                List<TicketAttachmentInputDto> attachments = request.Dto.Attachments ?? [];
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
                firstTicket ??= ticket; // Keep track of first ticket for response
            }

            bool isSuccess = await context.SaveChangesAsync(ct) > 0;

            if (!isSuccess || firstTicket == null)
                return Result<TicketDetailDto>.Failure("Failed to submit after-sales ticket.", 500);

            // 9. Return full detail via projection
            TicketDetailDto? dto = await context.AfterSalesTickets
                .AsNoTracking()
                .Include(t => t.OrderItem)
                .ThenInclude(oi => oi!.ProductVariant)
                .ThenInclude(pv => pv!.Product)
                .Include(t => t.Attachments.Where(a => a.DeletedAt == null))
                .Where(t => t.Id == firstTicket.Id)
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<TicketDetailDto>.Failure("Failed to retrieve created ticket.", 500);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

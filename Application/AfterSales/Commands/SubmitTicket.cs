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

<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
            // 6. Determine which items to create tickets for
            // Items are always required now, so create one ticket per selected item
            List<Guid> itemsToTicket = itemIdsToProcess;

            // 7. Check for duplicates and create tickets
            AfterSalesTicket? firstTicket = null;
            foreach (Guid itemId in itemsToTicket)
            {
                // Duplicate open ticket check (same order + same item + same type, not closed/rejected/resolved/cancelled)
=======
            // 6. Create tickets for each selected item
            List<TicketAttachmentInputDto> attachments = request.Dto.Attachments ?? [];
            AfterSalesTicket? lastCreatedTicket = null;

            foreach (Guid? orderItemId in orderItemIdsToProcess)
            {
                // Check duplicate open ticket
>>>>>>> Stashed changes
                bool duplicateExists = await context.AfterSalesTickets
                    .AsNoTracking()
                    .AnyAsync(t =>
                        t.OrderId == request.Dto.OrderId &&
<<<<<<< Updated upstream
                        t.OrderItemId == itemId &&
                        t.TicketType == request.Dto.TicketType &&
                        t.TicketStatus != AfterSalesTicketStatus.Rejected &&
                        t.TicketStatus != AfterSalesTicketStatus.Resolved &&
                        t.TicketStatus != AfterSalesTicketStatus.Closed &&
                        t.TicketStatus != AfterSalesTicketStatus.Cancelled, ct);

                if (duplicateExists)
                    return Result<TicketDetailDto>.Failure(
                        $"An open ticket of this type already exists for this order item.", 409);
=======
                        (orderItemId == null ? t.OrderItemId == null : t.OrderItemId == orderItemId) &&
                        t.TicketType == request.Dto.TicketType &&
                        t.TicketStatus != AfterSalesTicketStatus.Rejected &&
                        t.TicketStatus != AfterSalesTicketStatus.Resolved &&
                        t.TicketStatus != AfterSalesTicketStatus.Closed, ct);

                if (duplicateExists)
                    return Result<TicketDetailDto>.Failure(
                        "An open ticket of this type already exists for this order item.", 409);
>>>>>>> Stashed changes

                // Build ticket entity
                AfterSalesTicket ticket = new()
                {
                    OrderId = request.Dto.OrderId,
<<<<<<< Updated upstream
                    OrderItemId = itemId,
=======
                    OrderItemId = orderItemId,
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
                // Attach evidence files (same attachments for each ticket)
                List<TicketAttachmentInputDto> attachments = request.Dto.Attachments ?? [];
=======
                // Attach evidence files
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                firstTicket ??= ticket; // Keep track of first ticket for response
=======
                lastCreatedTicket = ticket;
>>>>>>> Stashed changes
            }

            bool isSuccess = await context.SaveChangesAsync(ct) > 0;

            if (!isSuccess || firstTicket == null)
                return Result<TicketDetailDto>.Failure("Failed to submit after-sales ticket.", 500);

            // 7. Return full detail of last created ticket via projection
            if (lastCreatedTicket == null)
                return Result<TicketDetailDto>.Failure("Failed to create ticket.", 500);

            TicketDetailDto? dto = await context.AfterSalesTickets
                .AsNoTracking()
<<<<<<< Updated upstream
                .Include(t => t.OrderItem)
                .ThenInclude(oi => oi!.ProductVariant)
                .ThenInclude(pv => pv!.Product)
                .Include(t => t.Attachments.Where(a => a.DeletedAt == null))
                .Where(t => t.Id == firstTicket.Id)
=======
                .Where(t => t.Id == lastCreatedTicket.Id)
>>>>>>> Stashed changes
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<TicketDetailDto>.Failure("Failed to retrieve created ticket.", 500);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

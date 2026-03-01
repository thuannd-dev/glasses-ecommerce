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

            // 2. Validate OrderItemId belongs to the order
            if (request.Dto.OrderItemId.HasValue)
            {
                bool itemExists = order.OrderItems.Any(i => i.Id == request.Dto.OrderItemId.Value);
                if (!itemExists)
                    return Result<TicketDetailDto>.Failure(
                        "The specified order item does not belong to this order.", 400);
            }

            // 3. Load active policy — enum values are aligned (Return=1, Warranty=2, Refund=3)
            PolicyType policyType = (PolicyType)request.Dto.TicketType;

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
                         (DateTime.UtcNow - deliveredAt.Value).TotalDays / 30 > policy.WarrantyMonths.Value)
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

            // 6. Duplicate open ticket check (same order + same item + same type, not closed/rejected/resolved)
            bool duplicateExists = await context.AfterSalesTickets
                .AsNoTracking()
                .AnyAsync(t =>
                    t.OrderId == request.Dto.OrderId &&
                    t.OrderItemId == request.Dto.OrderItemId &&
                    t.TicketType == request.Dto.TicketType &&
                    t.TicketStatus != AfterSalesTicketStatus.Rejected &&
                    t.TicketStatus != AfterSalesTicketStatus.Resolved &&
                    t.TicketStatus != AfterSalesTicketStatus.Closed, ct);

            if (duplicateExists)
                return Result<TicketDetailDto>.Failure(
                    "An open ticket of this type already exists for this order item.", 409);

            // 7. Build ticket entity
            AfterSalesTicket ticket = new()
            {
                OrderId = request.Dto.OrderId,
                OrderItemId = request.Dto.OrderItemId,
                CustomerId = userId,
                TicketType = request.Dto.TicketType,
                Reason = request.Dto.Reason,
                RequestedAction = string.IsNullOrWhiteSpace(request.Dto.RequestedAction)
                    ? null
                    : request.Dto.RequestedAction,
                RefundAmount = request.Dto.RefundAmount,
                IsRequiredEvidence = policy.EvidenceRequired,
                PolicyViolation = policyViolation,
                // Auto-set to Rejected if policy is violated; otherwise Pending
                TicketStatus = policyViolation != null
                    ? AfterSalesTicketStatus.Rejected
                    : AfterSalesTicketStatus.Pending
            };

            // 8. Attach evidence files
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
            bool isSuccess = await context.SaveChangesAsync(ct) > 0;

            if (!isSuccess)
                return Result<TicketDetailDto>.Failure("Failed to submit after-sales ticket.", 500);

            // 9. Return full detail via projection
            TicketDetailDto? dto = await context.AfterSalesTickets
                .AsNoTracking()
                .Where(t => t.Id == ticket.Id)
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<TicketDetailDto>.Failure("Failed to retrieve created ticket.", 500);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

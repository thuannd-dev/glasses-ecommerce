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

public sealed class ReceiveReturn
{
    public sealed class Command : IRequest<Result<TicketDetailDto>>
    {
        public required Guid TicketId { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<TicketDetailDto>>
    {
        public async Task<Result<TicketDetailDto>> Handle(Command request, CancellationToken ct)
        {
            AfterSalesTicket? ticket = await context.AfterSalesTickets
                .Include(t => t.Order)
                .Include(t => t.Customer)
                .FirstOrDefaultAsync(t => t.Id == request.TicketId, ct);

            if (ticket == null)
                return Result<TicketDetailDto>.Failure("Ticket not found.", 404);

            if (ticket.TicketStatus != AfterSalesTicketStatus.InProgress)
                return Result<TicketDetailDto>.Failure(
                    $"Cannot mark receipt on a ticket with status '{ticket.TicketStatus}'.", 400);

            if (ticket.ResolutionType == null ||
                ticket.ResolutionType == TicketResolutionType.RefundOnly)
                return Result<TicketDetailDto>.Failure(
                    "This ticket does not require physical goods return.", 400);

            if (ticket.ReceivedAt.HasValue)
                return Result<TicketDetailDto>.Failure(
                    "Goods have already been marked as received for this ticket.", 400);

            ticket.ReceivedAt = DateTime.UtcNow;

            // Update order status to Delivered and create OrderStatusHistory
            if (ticket.Order != null && ticket.Order.OrderStatus != OrderStatus.Delivered)
            {
                OrderStatus fromStatus = ticket.Order.OrderStatus;
                ticket.Order.OrderStatus = OrderStatus.Delivered;
                ticket.Order.UpdatedAt = DateTime.UtcNow;

                OrderStatusHistory history = new()
                {
                    OrderId = ticket.Order.Id,
                    FromStatus = fromStatus,
                    ToStatus = OrderStatus.Delivered,
                    Notes = "Warranty item received by operations",
                    ChangedBy = userAccessor.GetUserId(),
                    CreatedAt = DateTime.UtcNow
                };

                context.OrderStatusHistories.Add(history);
            }

            bool isSuccess = await context.SaveChangesAsync(ct) > 0;

            if (!isSuccess)
                return Result<TicketDetailDto>.Failure("Failed to update ticket.", 500);

            TicketDetailDto? dto = await context.AfterSalesTickets
                .AsNoTracking()
                .Include(t => t.OrderItem)
                .ThenInclude(oi => oi!.ProductVariant)
                .ThenInclude(pv => pv!.Product)
                .Include(t => t.Attachments.Where(a => a.DeletedAt == null))
                .Where(t => t.Id == ticket.Id)
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<TicketDetailDto>.Failure("Failed to retrieve updated ticket.", 500);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

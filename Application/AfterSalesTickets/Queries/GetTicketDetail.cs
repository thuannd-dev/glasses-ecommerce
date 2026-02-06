using Application.Core;
using Application.AfterSalesTickets.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSalesTickets.Queries;

public sealed class GetTicketDetail
{
    public sealed class Query : IRequest<Result<AfterSalesTicketDetailDto>>
    {
        public required Guid TicketId { get; set; }
    }

    public sealed class Handler(AppDbContext context) 
        : IRequestHandler<Query, Result<AfterSalesTicketDetailDto>>
    {
        public async Task<Result<AfterSalesTicketDetailDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var ticket = await context.AfterSalesTickets
                .Include(t => t.Order)
                    .ThenInclude(o => o.User)
                .Include(t => t.Order.Address)
                .Include(t => t.Order.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv.Product)
                .FirstOrDefaultAsync(t => t.Id == request.TicketId, cancellationToken);

            if (ticket == null)
            {
                return Result<AfterSalesTicketDetailDto>.Failure("Ticket not found", 404);
            }

            var orderSummary = new OrderSummaryDto
            {
                Id = ticket.Order.Id,
                OrderNumber = $"ORD-{ticket.Order.Id.ToString().Substring(0, 8).ToUpper()}",
                TotalAmount = ticket.Order.CalculateFinalAmount(),
                OrderType = ticket.Order.OrderType,
                CreatedAt = ticket.Order.CreatedAt,
                Items = ticket.Order.OrderItems.Select(oi => new OrderItemSummaryDto
                {
                    Id = oi.Id,
                    ProductName = oi.ProductVariant.Product.ProductName,
                    GlassModel = oi.ProductVariant.VariantName ?? "Standard",
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            };

            var ticketDetailDto = new AfterSalesTicketDetailDto
            {
                Id = ticket.Id,
                TicketNumber = $"TKT-{ticket.Id.ToString().Substring(0, 8).ToUpper()}",
                OrderId = ticket.OrderId,
                OrderNumber = $"ORD-{ticket.OrderId.ToString().Substring(0, 8).ToUpper()}",
                CustomerEmail = ticket.Order.User?.Email ?? "N/A",
                CustomerName = ticket.Order.User?.DisplayName ?? "Guest Customer",
                CustomerPhone = ticket.Order.Address.RecipientPhone,
                TicketType = ticket.TicketType,
                TicketStatus = ticket.TicketStatus,
                Reason = ticket.Reason,
                RequestedAction = ticket.RequestedAction,
                RefundAmount = ticket.RefundAmount,
                IsRequiredEvidence = ticket.IsRequiredEvidence,
                PolicyViolation = ticket.PolicyViolation,
                CreatedAt = ticket.CreatedAt,
                ResolvedAt = ticket.ResolvedAt,
                OrderSummary = orderSummary
            };

            return Result<AfterSalesTicketDetailDto>.Success(ticketDetailDto);
        }
    }
}

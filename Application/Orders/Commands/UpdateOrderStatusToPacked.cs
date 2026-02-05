using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Commands;

public sealed class UpdateOrderStatusToPacked
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public Guid OrderId { get; set; }
        
        public string? Notes { get; init; }
    }

    public sealed class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(
            Command request,
            CancellationToken cancellationToken)
        {
            try
            {
                var order = await context.Orders
                    .Include(o => o.StatusHistories)
                    .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

                if (order == null)
                {
                    return Result<Unit>.Failure("Order not found", 404);
                }

                // Validate that order can be marked as packed
                if (order.OrderStatus != OrderStatus.Processing && order.OrderStatus != OrderStatus.Confirmed)
                {
                    return Result<Unit>.Failure(
                        "Order must be in Processing or Confirmed status to mark as packed", 400);
                }

                var previousStatus = order.OrderStatus;
                order.OrderStatus = OrderStatus.Shipped; // or could use a "Packed" status if you add it
                order.UpdatedAt = DateTime.UtcNow;

                // Record status change
                var statusHistory = new OrderStatusHistory
                {
                    OrderId = order.Id,
                    FromStatus = previousStatus,
                    ToStatus = OrderStatus.Shipped,
                    Notes = request.Notes ?? "Order packed and ready for shipment",
                    CreatedAt = DateTime.UtcNow
                };

                context.OrderStatusHistories.Add(statusHistory);
                await context.SaveChangesAsync(cancellationToken);

                return Result<Unit>.Success(Unit.Value);
            }
            catch (Exception ex)
            {
                return Result<Unit>.Failure(
                    $"Error updating order status: {ex.Message}", 500);
            }
        }
    }
}

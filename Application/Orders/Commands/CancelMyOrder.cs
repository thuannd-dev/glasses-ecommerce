using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Commands;

//Customer tự hủy đơn hàng — kiểm tra quyền sở hữu và trạng thái cho phép hủy
public sealed class CancelMyOrder
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid OrderId { get; set; }
        public CancelMyOrderDto? Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            Guid userId = userAccessor.GetUserId();

            Order? order = await context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv!.Stock)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId
                    && o.UserId == userId, ct);

            if (order == null)
                return Result<Unit>.Failure("Order not found.", 404);

            // Check if order can be cancelled using domain logic
            if (!order.CanBeCancelled(DateTime.UtcNow))
                return Result<Unit>.Failure("This order can no longer be cancelled.", 400);

            if (order.OrderStatus is OrderStatus.Cancelled or OrderStatus.Completed or OrderStatus.Refunded)
                return Result<Unit>.Failure($"Cannot cancel an order with status '{order.OrderStatus}'.", 400);

            OrderStatus oldStatus = order.OrderStatus;

            // Release reserved stock
            foreach (OrderItem item in order.OrderItems)
            {
                if (item.ProductVariant?.Stock != null)
                {
                    item.ProductVariant.Stock.QuantityReserved -= item.Quantity;
                    item.ProductVariant.Stock.UpdatedAt = DateTime.UtcNow;
                    item.ProductVariant.Stock.UpdatedBy = userId;
                }
            }

            order.OrderStatus = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            context.OrderStatusHistories.Add(new OrderStatusHistory
            {
                OrderId = order.Id,
                FromStatus = oldStatus,
                ToStatus = OrderStatus.Cancelled,
                Notes = request.Dto?.Reason ?? "Cancelled by customer",
                ChangedBy = userId,
            });

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Unit>.Failure("Failed to cancel order.", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

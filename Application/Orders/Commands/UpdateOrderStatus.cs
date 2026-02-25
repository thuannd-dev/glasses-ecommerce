using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Commands;

public sealed class UpdateOrderStatus
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid OrderId { get; set; }
        public required UpdateOrderStatusDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            Guid staffUserId = userAccessor.GetUserId();

            Order? order = await context.Orders
                .FirstOrDefaultAsync(o => o.Id == request.OrderId
                    && o.CreatedBySalesStaff == staffUserId, ct);

            if (order == null)
                return Result<Unit>.Failure("Order not found.", 404);

            OrderStatus oldStatus = order.OrderStatus;
            OrderStatus newStatus = request.Dto.NewStatus;

            // Validate status transition
            if (!IsValidTransition(oldStatus, newStatus))
                return Result<Unit>.Failure(
                    $"Cannot transition from '{oldStatus}' to '{newStatus}'.", 400);

            // If cancelling, release reserved stock
            if (newStatus == OrderStatus.Cancelled)
            {
                List<OrderItem> items = await context.OrderItems
                    .Include(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv!.Stock)
                    .Where(oi => oi.OrderId == order.Id)
                    .ToListAsync(ct);

                foreach (OrderItem item in items)
                {
                    if (item.ProductVariant?.Stock != null)
                    {
                        item.ProductVariant.Stock.QuantityReserved =
                            Math.Max(0, item.ProductVariant.Stock.QuantityReserved - item.Quantity);
                        item.ProductVariant.Stock.UpdatedAt = DateTime.UtcNow;
                        item.ProductVariant.Stock.UpdatedBy = staffUserId;
                    }
                }
            }

            // If completing, reduce on-hand stock
            if (newStatus == OrderStatus.Completed)
            {
                List<OrderItem> items = await context.OrderItems
                    .Include(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv!.Stock)
                    .Where(oi => oi.OrderId == order.Id)
                    .ToListAsync(ct);

                foreach (OrderItem item in items)
                {
                    if (item.ProductVariant?.Stock != null)
                    {
                        item.ProductVariant.Stock.QuantityOnHand =
                            Math.Max(0, item.ProductVariant.Stock.QuantityOnHand - item.Quantity);
                        item.ProductVariant.Stock.QuantityReserved =
                            Math.Max(0, item.ProductVariant.Stock.QuantityReserved - item.Quantity);
                        item.ProductVariant.Stock.UpdatedAt = DateTime.UtcNow;
                        item.ProductVariant.Stock.UpdatedBy = staffUserId;
                    }
                }
            }

            order.OrderStatus = newStatus;
            order.UpdatedAt = DateTime.UtcNow;

            context.OrderStatusHistories.Add(new OrderStatusHistory
            {
                OrderId = order.Id,
                FromStatus = oldStatus,
                ToStatus = newStatus,
                Notes = request.Dto.Notes,
                ChangedBy = staffUserId,
            });

            bool isSuccess = await context.SaveChangesAsync(ct) > 0;

            if (!isSuccess)
                return Result<Unit>.Failure("Failed to update order status.", 400);

            return Result<Unit>.Success(Unit.Value);
        }

        private static bool IsValidTransition(OrderStatus from, OrderStatus to)
        {
            return (from, to) switch
            {
                (OrderStatus.Pending, OrderStatus.Confirmed) => true,
                (OrderStatus.Pending, OrderStatus.Cancelled) => true,
                (OrderStatus.Confirmed, OrderStatus.Processing) => true,
                (OrderStatus.Confirmed, OrderStatus.Cancelled) => true,
                (OrderStatus.Processing, OrderStatus.Shipped) => true,
                (OrderStatus.Processing, OrderStatus.Completed) => true, // Offline: skip shipping
                (OrderStatus.Processing, OrderStatus.Cancelled) => true,
                (OrderStatus.Shipped, OrderStatus.Delivered) => true,
                (OrderStatus.Delivered, OrderStatus.Completed) => true,
                _ => false,
            };
        }
    }
}

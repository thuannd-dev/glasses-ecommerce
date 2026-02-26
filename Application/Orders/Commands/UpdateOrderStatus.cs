using System.Data;
using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
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
            // Use RepeatableRead to prevent race condition on stock updates
            await using IDbContextTransaction transaction =
                await context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, ct);

            Guid staffUserId = userAccessor.GetUserId();

            Order? order = await context.Orders
                .Include(o => o.ShipmentInfo)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, ct);

            if (order == null)
                return Result<Unit>.Failure("Order not found.", 404);

            OrderStatus oldStatus = order.OrderStatus;
            OrderStatus newStatus = request.Dto.NewStatus;

            // Validate status transition
            if (!IsValidTransition(oldStatus, newStatus))
                return Result<Unit>.Failure(
                    $"Cannot transition from '{oldStatus}' to '{newStatus}'.", 400);

            // If cancelling or completing, load stocks with UPDLOCK to prevent race condition
            if (newStatus == OrderStatus.Cancelled || newStatus == OrderStatus.Completed)
            {
                List<OrderItem> items = await context.OrderItems
                    .Where(oi => oi.OrderId == order.Id)
                    .ToListAsync(ct);

                // Lock stock rows with UPDLOCK
                List<Guid> variantIds = items.Select(oi => oi.ProductVariantId).Distinct().ToList();
                string paramList = string.Join(", ", variantIds.Select((_, i) => $"@p{i}"));
                object[] sqlParams = variantIds
                    .Select((id, i) => (object)new SqlParameter($"@p{i}", id)).ToArray();

                List<Stock> stocks = await context.Stocks
                    .FromSqlRaw($"SELECT * FROM Stocks WITH (UPDLOCK) WHERE ProductVariantId IN ({paramList})", sqlParams)
                    .ToListAsync(ct);

                if (newStatus == OrderStatus.Cancelled)
                {
                    foreach (OrderItem item in items)
                    {
                        Stock? stock = stocks.FirstOrDefault(s => s.ProductVariantId == item.ProductVariantId);
                        if (stock != null)
                        {
                            stock.QuantityReserved =
                                Math.Max(0, stock.QuantityReserved - item.Quantity);
                            stock.UpdatedAt = DateTime.UtcNow;
                            stock.UpdatedBy = staffUserId;
                        }
                    }
                }

                if (newStatus == OrderStatus.Completed)
                {
                    foreach (OrderItem item in items)
                    {
                        Stock? stock = stocks.FirstOrDefault(s => s.ProductVariantId == item.ProductVariantId);
                        if (stock != null)
                        {
                            stock.QuantityOnHand =
                                Math.Max(0, stock.QuantityOnHand - item.Quantity);
                            stock.QuantityReserved =
                                Math.Max(0, stock.QuantityReserved - item.Quantity);
                            stock.UpdatedAt = DateTime.UtcNow;
                            stock.UpdatedBy = staffUserId;
                        }
                    }
                }
            }

            // If shipping, require and create shipment info
            if (newStatus == OrderStatus.Shipped)
            {
                if (request.Dto.Shipment == null)
                    return Result<Unit>.Failure("Shipment info is required when shipping an order.", 400);

                if (order.ShipmentInfo != null)
                    return Result<Unit>.Failure("Shipment info already exists for this order.", 409);

                context.Set<ShipmentInfo>().Add(new ShipmentInfo
                {
                    OrderId = order.Id,
                    CarrierName = request.Dto.Shipment.CarrierName,
                    TrackingCode = request.Dto.Shipment.TrackingCode,
                    TrackingUrl = request.Dto.Shipment.TrackingUrl,
                    EstimatedDeliveryAt = request.Dto.Shipment.EstimatedDeliveryAt,
                    ShippingNotes = request.Dto.Shipment.ShippingNotes,
                    ShippedAt = DateTime.UtcNow,
                    CreatedBy = staffUserId,
                    UpdatedAt = DateTime.UtcNow,
                });
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

            await transaction.CommitAsync(ct);

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

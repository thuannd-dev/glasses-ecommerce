using System.Data;
using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
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

            return await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                // Clear stale change-tracker state so each retry attempt starts fresh.
                context.ChangeTracker.Clear();

                await using IDbContextTransaction transaction =
                    await context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, ct);

                Order? order = await context.Orders
                    .Include(o => o.ShipmentInfo)
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

                // ReadyStock, Prescription và PreOrder orders đều cần giải phóng stock khi huỷ:
                //  - ReadyStock / Prescription: giải phóng QuantityReserved.
                //  - PreOrder (thuần / mixed): PreOrder items giải phóng QuantityPreOrdered (hoặc QuantityReserved
                //    nếu hàng đã về qua Inbound); Regular items trong mixed cart giải phóng QuantityReserved.
                if (order.OrderType == OrderType.ReadyStock
                    || order.OrderType == OrderType.Prescription
                    || order.OrderType == OrderType.PreOrder)
                {
                    List<OrderItem> items = await context.OrderItems
                        .Where(oi => oi.OrderId == order.Id)
                        .ToListAsync(ct);

                    if (items.Count > 0)
                    {
                        // Lock stock rows with UPDLOCK
                        List<Guid> variantIds = items.Select(oi => oi.ProductVariantId).Distinct().ToList();
                        List<Stock> stocks = await context.GetStocksWithLockAsync(variantIds, ct);
                        Dictionary<Guid, Stock> stockByVariant = stocks.ToDictionary(s => s.ProductVariantId);

                        // Load all variants for IsPreOrder check (needed for auto-disable logic)
                        List<ProductVariant> allVariants = await context.ProductVariants
                            .Where(pv => variantIds.Contains(pv.Id))
                            .ToListAsync(ct);
                        Dictionary<Guid, ProductVariant> variantById = allVariants.ToDictionary(pv => pv.Id);
                        Dictionary<Guid, bool> isPreOrderByVariant = allVariants.ToDictionary(pv => pv.Id, pv => pv.IsPreOrder);

                        foreach (OrderItem item in items)
                        {
                            if (!stockByVariant.TryGetValue(item.ProductVariantId, out Stock? stock))
                                return Result<Unit>.Failure(
                                    $"Stock record not found for product variant '{item.ProductVariantId}'.", 409);

                            // PreOrder item: có thể demand nằm ở QuantityPreOrdered (hàng chưa về)
                            // hoặc QuantityReserved (hàng đã về qua Inbound). Giải phóng Reserved trước.
                            if (order.OrderType == OrderType.PreOrder
                                && isPreOrderByVariant.TryGetValue(item.ProductVariantId, out bool isPreOrderItem)
                                && isPreOrderItem)
                            {
                                int fromReserved = Math.Min(item.Quantity, stock.QuantityReserved);
                                int fromPreOrdered = item.Quantity - fromReserved;

                                if (fromPreOrdered > stock.QuantityPreOrdered)
                                    return Result<Unit>.Failure(
                                        $"Cannot release more pre-order demand than tracked for variant '{item.ProductVariantId}'.", 409);

                                stock.QuantityReserved -= fromReserved;
                                stock.QuantityPreOrdered -= fromPreOrdered;
                            }
                            else
                            {
                                // Regular item (hoặc Regular item trong mixed PreOrder cart)
                                if (stock.QuantityReserved < item.Quantity)
                                    return Result<Unit>.Failure(
                                        $"Insufficient reserved stock for product variant '{item.ProductVariantId}'.", 409);

                                stock.QuantityReserved -= item.Quantity;
                            }

                            stock.UpdatedAt = DateTime.UtcNow;
                            stock.UpdatedBy = userId;

                            // Auto-disable pre-order if stock is now available (QuantityOnHand > 0)
                            // Defensive: disable pre-order if variant is marked as such but physical stock exists.
                            // This catches inconsistent state where Inbound should have already flipped the flag.
                            if (variantById.TryGetValue(item.ProductVariantId, out ProductVariant? variant) &&
                                variant.IsPreOrder && stock.QuantityOnHand > 0)
                            {
                                variant.IsPreOrder = false;
                            }
                        }
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

                await transaction.CommitAsync(ct);

                return Result<Unit>.Success(Unit.Value);
            });
        }
    }
}

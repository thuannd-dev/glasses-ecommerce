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
            Guid staffUserId = userAccessor.GetUserId();

            return await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                // Clear stale change-tracker state so each retry attempt starts fresh.
                context.ChangeTracker.Clear();

                // Serializable prevents phantom reads on the outbound-existence check:
                // RepeatableRead would allow UpdateOrderStatus to read "no outbound" while
                // RecordOutbound is mid-transaction inserting one, causing double stock deduction.
                // Both handlers now hold the same range locks so their outbound checks are serialized.
                await using IDbContextTransaction transaction =
                    await context.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

                // Acquire UPDLOCK+HOLDLOCK on the Orders row upfront — same lock ordering as RecordOutbound
                // (Orders first, then Stocks). Prevents the S→X upgrade deadlock cycle:
                // previously this handler took S-lock on Orders, then UPDLOCK on Stocks,
                // then tried to upgrade S→X on Orders at SaveChanges — forming a cycle if
                // RecordOutbound held S-lock on Orders waiting for UPDLOCK on Stocks.
                Order? order = await context.Orders
                    .FromSqlRaw(
                        "SELECT * FROM Orders WITH (UPDLOCK, HOLDLOCK) WHERE Id = @p0",
                        request.OrderId)
                    .Include(o => o.ShipmentInfo)
                    .Include(o => o.Payments)
                    .FirstOrDefaultAsync(ct);

                if (order == null)
                    return Result<Unit>.Failure("Order not found.", 404);

                OrderStatus oldStatus = order.OrderStatus;
                OrderStatus newStatus = request.Dto.NewStatus;

                // Validate status transition
                if (!IsValidTransition(oldStatus, newStatus))
                    return Result<Unit>.Failure(
                        $"Cannot transition from '{oldStatus}' to '{newStatus}'.", 400);

                // Auto-verify prescriptions when order transitions from Pending → Confirmed
                if (order.OrderType == OrderType.Prescription 
                    && oldStatus == OrderStatus.Pending 
                    && newStatus == OrderStatus.Confirmed)
                {
                    List<Prescription> unverifiedPrescriptions = await context.Prescriptions
                        .Where(p => p.OrderId == order.Id && !p.IsVerified)
                        .ToListAsync(ct);

                    foreach (Prescription prescription in unverifiedPrescriptions)
                    {
                        prescription.IsVerified = true;
                        prescription.VerifiedAt = DateTime.UtcNow;
                        prescription.VerifiedBy = staffUserId;
                    }
                }

                // ReadyStock, Prescription và PreOrder orders đều cần điều chỉnh stock khi cancel/complete:
                //  - ReadyStock / Prescription: khi tạo đơn đã reserve → giải phóng QuantityReserved khi cancel, trừ QuantityOnHand khi complete.
                //  - PreOrder (thuần / mixed): PreOrder items dùng QuantityPreOrdered (chưa có hàng)
                //    hoặc QuantityReserved (hàng đã về qua Inbound); Regular items trong mixed cart dùng QuantityReserved.
                if ((order.OrderType == OrderType.ReadyStock
                    || order.OrderType == OrderType.Prescription
                    || order.OrderType == OrderType.PreOrder) &&
                    (newStatus == OrderStatus.Cancelled || newStatus == OrderStatus.Completed))
                {
                    List<OrderItem> items = await context.OrderItems
                        .Where(oi => oi.OrderId == order.Id)
                        .ToListAsync(ct);

                    if (items.Count == 0)
                        return Result<Unit>.Failure("Order has no items.", 400);

                    // Lock stock rows with UPDLOCK
                    List<Guid> variantIds = items.Select(oi => oi.ProductVariantId).Distinct().ToList();
                    List<Stock> stocks = await context.GetStocksWithLockAsync(variantIds, ct);
                    Dictionary<Guid, Stock> stockByVariant = stocks.ToDictionary(s => s.ProductVariantId);

                    // Load variants chỉ khi là PreOrder order — cần biết IsPreOrder của từng item
                    Dictionary<Guid, bool> isPreOrderByVariant = [];
                    if (order.OrderType == OrderType.PreOrder)
                    {
                        List<ProductVariant> variants = await context.ProductVariants
                            .AsNoTracking()
                            .Where(pv => variantIds.Contains(pv.Id))
                            .ToListAsync(ct);
                        isPreOrderByVariant = variants.ToDictionary(pv => pv.Id, pv => pv.IsPreOrder);
                    }

                    if (newStatus == OrderStatus.Cancelled)
                    {
                        foreach (OrderItem item in items)
                        {
                            if (!stockByVariant.TryGetValue(item.ProductVariantId, out Stock? stock))
                                return Result<Unit>.Failure(
                                    $"Stock record not found for product variant '{item.ProductVariantId}'.", 409);

                            // PreOrder order: branch on whether this specific variant is flagged IsPreOrder.
                            // Fail fast if the variant is missing from the lookup — silently falling into the
                            // regular-item branch would skew QuantityReserved on a data-inconsistency bug.
                            if (order.OrderType == OrderType.PreOrder)
                            {
                                if (!isPreOrderByVariant.TryGetValue(item.ProductVariantId, out bool isPreOrderItem))
                                    return Result<Unit>.Failure(
                                        $"Product variant '{item.ProductVariantId}' not found while reconciling pre-order stock.", 409);

                                if (isPreOrderItem)
                                {
                                    // Demand có thể nằm ở QuantityPreOrdered (hàng chưa về)
                                    // hoặc QuantityReserved (hàng đã về qua Inbound).
                                    // Giải phóng QuantityReserved trước, phần còn lại từ QuantityPreOrdered.
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
                                    // Regular item trong mixed PreOrder cart: giải phóng reserved.
                                    if (stock.QuantityReserved < item.Quantity)
                                        return Result<Unit>.Failure(
                                            $"Insufficient reserved stock for product variant '{item.ProductVariantId}'.", 409);

                                    stock.QuantityReserved -= item.Quantity;
                                }
                            }
                            else
                            {
                                // ReadyStock / Prescription: giải phóng reserved.
                                if (stock.QuantityReserved < item.Quantity)
                                    return Result<Unit>.Failure(
                                        $"Insufficient reserved stock for product variant '{item.ProductVariantId}'.", 409);

                                stock.QuantityReserved -= item.Quantity;
                            }

                            stock.UpdatedAt = DateTime.UtcNow;
                            stock.UpdatedBy = staffUserId;
                        }
                    }

                    if (newStatus == OrderStatus.Completed)
                    {
                        // Load all outbound transactions for this order to validate per-variant coverage.
                        // AnyAsync is too coarse: one stray row would skip deductions for all variants.
                        // Group by variant and sum quantities so multi-row outbounds (split shipments) are handled correctly.
                        Dictionary<Guid, int> outboundQtyByVariant = (await context.InventoryTransactions
                            .Where(t => t.ReferenceType == ReferenceType.Order
                                && t.ReferenceId == order.Id
                                && t.TransactionType == TransactionType.Outbound)
                            .ToListAsync(ct))
                            .GroupBy(t => t.ProductVariantId)
                            .ToDictionary(g => g.Key, g => g.Sum(t => t.Quantity));

                        if (outboundQtyByVariant.Count == 0)
                        {
                            // No outbound recorded at all — this order bypassed RecordOutbound (e.g. offline/walk-in).
                            // Deduct stock here.
                            foreach (OrderItem item in items)
                            {
                                if (!stockByVariant.TryGetValue(item.ProductVariantId, out Stock? stock))
                                    return Result<Unit>.Failure(
                                        $"Stock record not found for product variant '{item.ProductVariantId}'.", 409);
                                if (stock.QuantityOnHand < item.Quantity || stock.QuantityReserved < item.Quantity)
                                    return Result<Unit>.Failure(
                                        $"Insufficient stock for product variant '{item.ProductVariantId}'.", 409);

                                stock.QuantityOnHand -= item.Quantity;
                                stock.QuantityReserved -= item.Quantity;
                                stock.UpdatedAt = DateTime.UtcNow;
                                stock.UpdatedBy = staffUserId;
                            }
                        }
                        else
                        {
                            // Outbound rows exist — validate full per-variant coverage before skipping deduction.
                            // Partial coverage (missing variant or short quantity) is a data-integrity violation → 409.
                            foreach (OrderItem item in items)
                            {
                                if (!outboundQtyByVariant.TryGetValue(item.ProductVariantId, out int outboundQty))
                                    return Result<Unit>.Failure(
                                        $"Outbound record missing for product variant '{item.ProductVariantId}'. " +
                                        "Cannot complete order with partial outbound coverage.", 409);

                                if (outboundQty < item.Quantity)
                                    return Result<Unit>.Failure(
                                        $"Outbound quantity ({outboundQty}) for product variant '{item.ProductVariantId}' " +
                                        $"is less than order quantity ({item.Quantity}). Cannot complete order.", 409);
                            }
                            // All variants fully covered by outbound — stock already deducted by RecordOutbound.
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

                // When order is delivered, set payment status to Completed
                if (newStatus == OrderStatus.Delivered && order.Payments.Count > 0)
                {
                    foreach (Payment payment in order.Payments)
                    {
                        if (payment.PaymentStatus != PaymentStatus.Refunded)
                        {
                            payment.PaymentStatus = PaymentStatus.Completed;
                            payment.PaymentAt = DateTime.UtcNow;
                        }
                    }
                }

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
            });
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

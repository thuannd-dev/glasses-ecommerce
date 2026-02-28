using System.Data;
using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Persistence;

namespace Application.Orders.Commands;

public sealed class Checkout
{
    //cart → order, reserve stock, promo, mark cart Converted
    public sealed class Command : IRequest<Result<CustomerOrderDto>>
    {
        public required CheckoutDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<CustomerOrderDto>>
    {
        public async Task<Result<CustomerOrderDto>> Handle(Command request, CancellationToken ct)
        {
            CheckoutDto dto = request.Dto;
            Guid userId = userAccessor.GetUserId();

            // idempotency: generate ID upfront so a post-commit retry does not create a duplicate order.
            Guid orderId = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

            // ExecuteAsync returns only the new Order ID after commit.
            // The re-query (ProjectTo) runs OUTSIDE the retry scope so a transient failure
            // there cannot retry the whole transaction and create a duplicate order or
            // see "Cart is empty" because the cart was already marked Converted.
            Result<Guid> transactionResult = await context.Database
                .CreateExecutionStrategy().ExecuteAsync<Result<Guid>>(async () =>
            {
                // Clear stale change-tracker state so each retry attempt starts fresh.
                context.ChangeTracker.Clear();

                // VERIFY SUCCEEDED:
                // If this is a retry and the previous attempt actually committed the DB transaction
                // before connection dropped, the order will already exist. We can safely return.
                if (await context.Orders.AnyAsync(o => o.Id == orderId, ct))
                    return Result<Guid>.Success(orderId);

                // Serializable prevents phantom reads on the promo usage CountAsync + insert:
                // two concurrent requests could both read usedCount < limit under RepeatableRead,
                // then both insert, exceeding the limit. Serializable also serializes the
                // duplicate-cart-checkout edge case.
                await using IDbContextTransaction transaction =
                    await context.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

                // 1. Get active cart with items
                Cart? cart = await context.Carts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.UserId == userId
                        && c.Status == CartStatus.Active, ct);

                if (cart == null || cart.Items.Count == 0)
                    return Result<Guid>.Failure("Cart is empty.", 400);

                var selectedItems = cart.Items
                    .Where(i => dto.SelectedCartItemIds.Contains(i.Id))
                    .ToList();

                if (selectedItems.Count == 0)
                    return Result<Guid>.Failure("None of the selected items exist in your cart.", 400);

                if (selectedItems.Count != dto.SelectedCartItemIds.Count)
                    return Result<Guid>.Failure("One or more selected items do not exist in your cart.", 400);

                // 2. Validate address
                bool addressExists = await context.Addresses
                    .AnyAsync(a => a.Id == dto.AddressId
                        && a.UserId == userId && !a.IsDeleted, ct);

                if (!addressExists)
                    return Result<Guid>.Failure("Address not found.", 404);

                // 3. Aggregate cart items by variant to get correct per-variant totals.
                // A cart can have multiple rows for the same variant; checking each row
                // individually could let per-row quantities pass while the aggregate exceeds stock.
                var mergedItems = selectedItems
                    .GroupBy(i => i.ProductVariantId)
                    .Select(g => new { ProductVariantId = g.Key, Quantity = g.Sum(i => i.Quantity) })
                    .ToList();

                List<Guid> variantIds = mergedItems.Select(i => i.ProductVariantId).ToList();
                List<ProductVariant> variants = await context.ProductVariants
                    .Include(pv => pv.Product)
                    .Where(pv => variantIds.Contains(pv.Id))
                    .ToListAsync(ct);

                if (variants.Count != variantIds.Distinct().Count())
                    return Result<Guid>.Failure("One or more products are no longer available.", 400);

                // Load stocks with UPDLOCK to prevent race condition on reservation
                string paramList = string.Join(", ", variantIds.Select((_, i) => $"@p{i}"));
                object[] sqlParams = variantIds
                    .Select((id, i) => (object)new SqlParameter($"@p{i}", id)).ToArray();

                await context.Stocks
                    .FromSqlRaw($"SELECT * FROM Stocks WITH (UPDLOCK) WHERE ProductVariantId IN ({paramList})", sqlParams)
                    .ToListAsync(ct);
                // EF Core relationship fixup auto-links variant.Stock

                if (dto.OrderType == OrderType.ReadyStock)
                {
                    foreach (var mergedItem in mergedItems)
                    {
                        ProductVariant variant = variants.First(v => v.Id == mergedItem.ProductVariantId);
                        if (!variant.IsActive)
                            return Result<Guid>.Failure(
                                $"Product '{variant.VariantName}' is no longer available.", 400);

                        if (variant.Stock == null || variant.Stock.QuantityAvailable < mergedItem.Quantity)
                            return Result<Guid>.Failure(
                                $"Insufficient stock for '{variant.VariantName}'. Available: {variant.Stock?.QuantityAvailable ?? 0}.", 400);
                    }
                }

                // 4. Calculate totals (use mergedItems for order items too)
                decimal totalAmount = 0;
                List<OrderItem> orderItems = new List<OrderItem>();

                foreach (var mergedItem in mergedItems)
                {
                    ProductVariant variant = variants.First(v => v.Id == mergedItem.ProductVariantId);
                    decimal unitPrice = variant.Price;
                    totalAmount += unitPrice * mergedItem.Quantity;

                    orderItems.Add(new OrderItem
                    {
                        ProductVariantId = mergedItem.ProductVariantId,
                        Quantity = mergedItem.Quantity,
                        UnitPrice = unitPrice,
                        OrderId = Guid.Empty,
                    });
                }

                decimal shippingFee = 0; // TODO: Calculate shipping fee

                // 5. Handle promotion
                Promotion? promotion = null;
                decimal discountApplied = 0;

                if (!string.IsNullOrWhiteSpace(dto.PromoCode))
                {
                    DateTime now = DateTime.UtcNow;
                    promotion = await context.Promotions
                        .FirstOrDefaultAsync(p => p.PromoCode == dto.PromoCode
                            && p.IsActive
                            && p.ValidFrom <= now
                            && p.ValidTo >= now, ct);

                    if (promotion == null)
                        return Result<Guid>.Failure("Invalid or expired promo code.", 400);

                    if (promotion.UsageLimit.HasValue)
                    {
                        int usedCount = await context.PromoUsageLogs
                            .CountAsync(l => l.PromotionId == promotion.Id, ct);
                        if (usedCount >= promotion.UsageLimit.Value)
                            return Result<Guid>.Failure("Promo code usage limit reached.", 400);
                    }

                    discountApplied = promotion.PromotionType switch
                    {
                        PromotionType.Percentage => Math.Round(totalAmount * promotion.DiscountValue / 100, 2),
                        PromotionType.FixedAmount => promotion.DiscountValue,
                        _ => 0
                    };

                    if (promotion.MaxDiscountValue.HasValue && discountApplied > promotion.MaxDiscountValue.Value)
                        discountApplied = promotion.MaxDiscountValue.Value;

                    if (discountApplied > totalAmount)
                        discountApplied = totalAmount;
                }

                // 6. Create Order
                Order order = new Order
                {
                    Id = orderId, // explicitly assigned from outside retry scope
                    OrderSource = OrderSource.Online,
                    OrderType = dto.OrderType,
                    OrderStatus = OrderStatus.Pending,
                    UserId = userId,
                    AddressId = dto.AddressId,
                    TotalAmount = totalAmount,
                    ShippingFee = shippingFee,
                    CustomerNote = dto.CustomerNote,
                    CancellationDeadline = dto.OrderType == OrderType.Prescription
                        ? DateTime.UtcNow.AddHours(24) : null,
                };

                context.Orders.Add(order);

                // 7. Assign OrderId to items
                foreach (OrderItem item in orderItems)
                {
                    item.OrderId = order.Id;
                }
                context.OrderItems.AddRange(orderItems);

                // 8. Reserve stock (ReadyStock only — only this type reserves on create)
                if (dto.OrderType == OrderType.ReadyStock)
                {
                    foreach (var mergedItem in mergedItems)
                    {
                        Stock stock = variants.First(v => v.Id == mergedItem.ProductVariantId).Stock!;
                        stock.QuantityReserved += mergedItem.Quantity;
                        stock.UpdatedAt = DateTime.UtcNow;
                        stock.UpdatedBy = userId;
                    }
                }

                // 9. Create Payment
                Payment payment = new Payment
                {
                    OrderId = order.Id,
                    PaymentMethod = dto.PaymentMethod,
                    Amount = totalAmount + shippingFee - discountApplied,
                    PaymentStatus = PaymentStatus.Pending,
                    PaymentType = PaymentType.Full,
                };
                context.Payments.Add(payment);

                // 10. Promo usage
                if (promotion != null && discountApplied > 0)
                {
                    order.ApplyPromotion(new PromoUsageLog
                    {
                        OrderId = order.Id,
                        PromotionId = promotion.Id,
                        DiscountApplied = discountApplied,
                        UsedAt = DateTime.UtcNow,
                    });
                }

                // 11. Prescription
                if (dto.OrderType == OrderType.Prescription && dto.Prescription != null)
                {
                    Prescription prescription = new Prescription
                    {
                        OrderId = order.Id,
                        IsVerified = false,
                    };
                    context.Prescriptions.Add(prescription);

                    foreach (PrescriptionDetailInputDto detail in dto.Prescription.Details)
                    {
                        context.PrescriptionDetails.Add(new PrescriptionDetail
                        {
                            PrescriptionId = prescription.Id,
                            Eye = detail.Eye,
                            SPH = detail.SPH,
                            CYL = detail.CYL,
                            AXIS = detail.AXIS,
                            PD = detail.PD,
                            ADD = detail.ADD,
                        });
                    }
                }

                // 12. Status history
                context.OrderStatusHistories.Add(new OrderStatusHistory
                {
                    OrderId = order.Id,
                    FromStatus = OrderStatus.Pending,
                    ToStatus = OrderStatus.Pending,
                    Notes = "Order placed by customer",
                    ChangedBy = userId,
                });

                // 13. Cart Split Logic for Partial Checkout
                var unselectedItems = cart.Items.Except(selectedItems).ToList();

                // Mark original (now holding only ordered items) as Converted FIRST
                cart.Status = CartStatus.Converted;

                // Save immediately to release the "Active" unique constraint for this user
                bool success = await context.SaveChangesAsync(ct) > 0;
                if (!success)
                    return Result<Guid>.Failure("Failed to process cart status.", 500);

                if (unselectedItems.Count > 0)
                {
                    // Remove unselected items from the original cart so it only reflects what was ordered
                    foreach (var item in unselectedItems)
                    {
                        cart.Items.Remove(item);
                        context.CartItems.Remove(item); // Avoid orphaned items or DB conflicts
                    }

                    // Create a new active cart for the remaining items NOW (since the old one is no longer Active)
                    Cart newActiveCart = new Cart
                    {
                        UserId = userId,
                        Status = CartStatus.Active
                    };

                    foreach (var item in unselectedItems)
                    {
                        newActiveCart.Items.Add(new CartItem
                        {
                            CartId = newActiveCart.Id,
                            ProductVariantId = item.ProductVariantId,
                            Quantity = item.Quantity
                        });
                    }
                    context.Carts.Add(newActiveCart);

                    // The second SaveChanges happens below
                }

                // 14. Save remaining split changes (only when there are any)
                if (unselectedItems.Count > 0)
                {
                    bool finalSuccess = await context.SaveChangesAsync(ct) > 0;
                    if (!finalSuccess)
                        return Result<Guid>.Failure("Failed to place order.", 500);
                }

                await transaction.CommitAsync(ct);

                // Return only the ID — re-query happens outside the retry scope.
                return Result<Guid>.Success(order.Id);
            });

            if (!transactionResult.IsSuccess)
                return Result<CustomerOrderDto>.Failure(transactionResult.Error!, transactionResult.Code);

            // 15. Re-query with ProjectTo (outside retry delegate).
            // If this fails it does NOT retry the transaction.
            CustomerOrderDto result = await context.Orders
                .Where(o => o.Id == transactionResult.Value)
                .ProjectTo<CustomerOrderDto>(mapper.ConfigurationProvider)
                .FirstAsync(ct);

            return Result<CustomerOrderDto>.Success(result);
        }
    }
}

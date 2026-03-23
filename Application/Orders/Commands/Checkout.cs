using System.Data;
using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
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
        IUserAccessor userAccessor,
        IEmailService emailService,
        IGHNService ghnService) : IRequestHandler<Command, Result<CustomerOrderDto>>
    {
        public async Task<Result<CustomerOrderDto>> Handle(Command request, CancellationToken ct)
        {
            CheckoutDto dto = request.Dto;
            Guid userId = userAccessor.GetUserId();

            // idempotency: generate ID upfront so a post-commit retry does not create a duplicate order.
            Guid orderId = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

            if (dto.DistrictId <= 0 || string.IsNullOrWhiteSpace(dto.WardCode))
                return Result<CustomerOrderDto>.Failure("DistrictId and WardCode are required to calculate shipping fee.", 400);

            decimal estimatedTotalAmount = await context.CartItems
                .Where(ci => ci.Cart.UserId == userId && ci.Cart.Status == CartStatus.Active && dto.SelectedCartItemIds.Contains(ci.Id))
                .Select(ci => ci.Quantity * ci.ProductVariant.Price)
                .SumAsync(ct);

            decimal precalculatedShippingFee;
            try
            {
                precalculatedShippingFee = await ghnService.CalculateShippingFeeAsync(dto.DistrictId, dto.WardCode, 200, estimatedTotalAmount);
            }
            catch (Exception ex)
            {
                return Result<CustomerOrderDto>.Failure(ex.Message, 400);
            }

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

                List<CartItem> selectedItems = cart.Items
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

                // Load stocks with UPDLOCK to prevent race condition on reservation;
                // EF Core relationship fixup auto-links each variant.Stock navigation property.
                _ = await context.GetStocksWithLockAsync(variantIds, ct);

                // Ensure all ordered product variants are active
                foreach (var mergedItem in mergedItems)
                {
                    ProductVariant variant = variants.First(v => v.Id == mergedItem.ProductVariantId);
                    if (!variant.IsActive)
                        return Result<Guid>.Failure(
                            $"Product '{variant.VariantName}' is no longer available.", 400);
                }

                // Phân loại items: PreOrder vs Regular
                bool hasPreOrderItems = mergedItems
                    .Any(m => variants.First(v => v.Id == m.ProductVariantId).IsPreOrder);
                bool hasRegularItems = mergedItems
                    .Any(m => !variants.First(v => v.Id == m.ProductVariantId).IsPreOrder);

                // Nếu toàn bộ hoặc có bất kỳ PreOrder item nào → order type bị ép thành PreOrder.
                // Mixed cart (Regular + PreOrder) cũng gộp chung 1 đơn, chờ đủ hàng rồi ship 1 lần.
                OrderType resolvedOrderType = hasPreOrderItems ? OrderType.PreOrder : dto.OrderType;

                // Kiểm tra stock chỉ cho những Regular items trong đơn
                // (PreOrder items bỏ qua bước này vì hàng chưa có)
                if (resolvedOrderType == OrderType.ReadyStock || resolvedOrderType == OrderType.Prescription)
                {
                    foreach (var mergedItem in mergedItems)
                    {
                        ProductVariant variant = variants.First(v => v.Id == mergedItem.ProductVariantId);
                        if (variant.Stock == null || variant.Stock.QuantityAvailable < mergedItem.Quantity)
                            return Result<Guid>.Failure(
                                $"Insufficient stock for '{variant.VariantName}'. Available: {variant.Stock?.QuantityAvailable ?? 0}.", 400);
                    }
                }
                else if (resolvedOrderType == OrderType.PreOrder && hasRegularItems)
                {
                    // Mixed cart: chỉ kiểm tra stock cho Regular items (PreOrder items bỏ qua)
                    foreach (var mergedItem in mergedItems)
                    {
                        ProductVariant variant = variants.First(v => v.Id == mergedItem.ProductVariantId);
                        if (!variant.IsPreOrder)
                        {
                            if (variant.Stock == null || variant.Stock.QuantityAvailable < mergedItem.Quantity)
                                return Result<Guid>.Failure(
                                    $"Insufficient stock for '{variant.VariantName}'. Available: {variant.Stock?.QuantityAvailable ?? 0}.", 400);
                        }
                    }
                }

                // 4. Calculate totals and build OrderItems.
                // Items with prescriptions are kept as individual order lines so each line can hold
                // a distinct prescription. Non-prescription items are merged by variant as before.
                HashSet<Guid> prescriptionCartItemIds = dto.Prescriptions?
                    .Select(p => p.CartItemId)
                    .ToHashSet() ?? [];

                // cartItemId → OrderItem lookup for prescription items (used when linking prescriptions below)
                Dictionary<Guid, OrderItem> cartItemOrderItemMap = [];

                decimal totalAmount = 0;
                List<OrderItem> orderItems = [];

                // Non-prescription items: merge by variant (aggregate quantity)
                var mergedNonPrescriptionItems = selectedItems
                    .Where(i => !prescriptionCartItemIds.Contains(i.Id))
                    .GroupBy(i => i.ProductVariantId)
                    .Select(g => new { ProductVariantId = g.Key, Quantity = g.Sum(i => i.Quantity) })
                    .ToList();

                foreach (var item in mergedNonPrescriptionItems)
                {
                    ProductVariant variant = variants.First(v => v.Id == item.ProductVariantId);
                    decimal unitPrice = variant.Price;
                    totalAmount += unitPrice * item.Quantity;

                    orderItems.Add(new OrderItem
                    {
                        ProductVariantId = item.ProductVariantId,
                        Quantity = item.Quantity,
                        UnitPrice = unitPrice,
                        OrderId = Guid.Empty,
                    });
                }

                // Prescription items: one OrderItem per cart item to allow a distinct prescription per line
                foreach (CartItem cartItem in selectedItems.Where(i => prescriptionCartItemIds.Contains(i.Id)))
                {
                    ProductVariant variant = variants.First(v => v.Id == cartItem.ProductVariantId);
                    decimal unitPrice = variant.Price;
                    totalAmount += unitPrice * cartItem.Quantity;

                    OrderItem orderItem = new OrderItem
                    {
                        ProductVariantId = cartItem.ProductVariantId,
                        Quantity = cartItem.Quantity,
                        UnitPrice = unitPrice,
                        OrderId = Guid.Empty,
                    };
                    orderItems.Add(orderItem);
                    cartItemOrderItemMap[cartItem.Id] = orderItem;
                }

                // Use the precalculated shipping fee to avoid external API calls inside Serializable transaction
                decimal shippingFee = precalculatedShippingFee;

                // 5. Handle promotion
                Promotion? promotion = null;
                decimal discountApplied = 0;

                if (!string.IsNullOrWhiteSpace(dto.PromoCode))
                {
                    DateTime now = DateTime.UtcNow;
                    promotion = await context.Promotions
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.PromoCode == dto.PromoCode.ToUpper()
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

                    if (promotion.UsageLimitPerCustomer.HasValue)
                    {
                        int customerUsed = await context.PromoUsageLogs
                            .CountAsync(l => l.PromotionId == promotion.Id && l.UsedBy == userId, ct);
                        if (customerUsed >= promotion.UsageLimitPerCustomer.Value)
                            return Result<Guid>.Failure(
                                "You have already used this promo code the maximum number of times.", 400);
                    }

                    discountApplied = promotion.PromotionType switch
                    {
                        PromotionType.Percentage => Math.Round(totalAmount * promotion.DiscountValue / 100, 2),
                        PromotionType.FixedAmount => promotion.DiscountValue,
                        PromotionType.FreeShipping => shippingFee,
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
                    OrderType = resolvedOrderType,
                    OrderStatus = OrderStatus.Pending,
                    UserId = userId,
                    AddressId = dto.AddressId,
                    TotalAmount = totalAmount,
                    ShippingFee = shippingFee,
                    CustomerNote = dto.CustomerNote,
                    CancellationDeadline = resolvedOrderType == OrderType.Prescription
                        ? DateTime.UtcNow.AddHours(24) : null,
                };

                context.Orders.Add(order);

                // 7. Assign OrderId to items
                foreach (OrderItem item in orderItems)
                {
                    item.OrderId = order.Id;
                }
                context.OrderItems.AddRange(orderItems);

                // 8. Reserve stock cho ReadyStock/Prescription; track demand cho PreOrder
                if (resolvedOrderType == OrderType.ReadyStock || resolvedOrderType == OrderType.Prescription)
                {
                    foreach (var mergedItem in mergedItems)
                    {
                        Stock stock = variants.First(v => v.Id == mergedItem.ProductVariantId).Stock!;
                        stock.QuantityReserved += mergedItem.Quantity;
                        stock.UpdatedAt = DateTime.UtcNow;
                        stock.UpdatedBy = userId;
                    }
                }
                else if (resolvedOrderType == OrderType.PreOrder)
                {
                    // PreOrder items (IsPreOrder = true): hàng chưa có trong kho → ghi nhận demand vào QuantityPreOrdered.
                    // Regular items trong mixed cart (IsPreOrder = false): hàng có sẵn → reserve bình thường vào QuantityReserved.
                    foreach (var mergedItem in mergedItems)
                    {
                        ProductVariant variant = variants.First(v => v.Id == mergedItem.ProductVariantId);
                        if (variant.IsPreOrder && variant.Stock != null)
                        {
                            variant.Stock.QuantityPreOrdered += mergedItem.Quantity;
                            variant.Stock.UpdatedAt = DateTime.UtcNow;
                            variant.Stock.UpdatedBy = userId;
                        }
                        else if (variant.IsPreOrder && variant.Stock == null)
                        {
                            return Result<Guid>.Failure(
                                $"PreOrder variant '{variant.VariantName}' has no stock record configured.", 400);
                        }
                        else if (!variant.IsPreOrder)
                        {
                            // Regular item trong mixed PreOrder cart: reserve bình thường
                            // (hàng có sẵn, chỉ cần giữ chỗ khi đợi PreOrder về)
                            Stock stock = variant.Stock!;
                            stock.QuantityReserved += mergedItem.Quantity;
                            stock.UpdatedAt = DateTime.UtcNow;
                            stock.UpdatedBy = userId;
                        }
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
                if (promotion != null)
                {
                    order.ApplyPromotion(new PromoUsageLog
                    {
                        OrderId = order.Id,
                        PromotionId = promotion.Id,
                        DiscountApplied = discountApplied,
                        UsedAt = DateTime.UtcNow,
                        UsedBy = userId,
                    });
                }

                // 11. Prescription (lưu nếu có, bất kể OrderType — PreOrder cũng có thể kèm đơn thuốc)
                if (dto.Prescriptions != null && dto.Prescriptions.Count > 0)
                {
                    foreach (OrderItemPrescriptionDto prescriptionInfo in dto.Prescriptions)
                    {
                        Prescription prescription = new Prescription
                        {
                            OrderId = order.Id,
                            IsVerified = false,
                        };
                        context.Prescriptions.Add(prescription);

                        foreach (PrescriptionDetailInputDto detail in prescriptionInfo.Prescription.Details)
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

                        // Direct lookup: each prescription cart item has its own dedicated OrderItem,
                        // built during OrderItem creation above — no variant-ambiguity possible.
                        if (!cartItemOrderItemMap.TryGetValue(prescriptionInfo.CartItemId, out OrderItem? orderItem))
                            return Result<Guid>.Failure($"Cart item {prescriptionInfo.CartItemId} for prescription not found in selected items.", 400);

                        orderItem.PrescriptionId = prescription.Id;
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
                List<CartItem> unselectedItems = cart.Items.Except(selectedItems).ToList();

                // Mark original (now holding only ordered items) as Converted FIRST
                cart.Status = CartStatus.Converted;

                // Save immediately to release the "Active" unique constraint for this user
                bool success = await context.SaveChangesAsync(ct) > 0;
                if (!success)
                    return Result<Guid>.Failure("Failed to process cart status.", 500);

                if (unselectedItems.Count > 0)
                {
                    // Create a new active cart for the remaining items NOW (since the old one is no longer Active)
                    Cart newActiveCart = new Cart
                    {
                        UserId = userId,
                        Status = CartStatus.Active
                    };
                    context.Carts.Add(newActiveCart);

                    // Move unselected items to the new cart, preserving their existing IDs
                    foreach (CartItem item in unselectedItems)
                    {
                        cart.Items.Remove(item);
                        item.CartId = newActiveCart.Id;
                        newActiveCart.Items.Add(item);
                    }

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

            // 15. Get customer email for email sending (before final query)
            // Only User is needed for the email — everything else comes from `result` (already fetched above).
            Order? orderForEmail = await context.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == transactionResult.Value, ct);

            // 16. Re-query with ProjectTo (outside retry delegate).
            // If this fails it does NOT retry the transaction.
            CustomerOrderDto result = await context.Orders
                .AsNoTracking()
                .Where(o => o.Id == transactionResult.Value)
                .Include(o => o.Address)
                .Include(o => o.PromoUsageLogs)
                  .ThenInclude(p => p.Promotion)
                .Include(o => o.OrderItems)
                  .ThenInclude(oi => oi.ProductVariant)
                  .ThenInclude(pv => pv.Product)
                  .ThenInclude(p => p.Images)
                .Include(o => o.Payments)
                .Include(o => o.Prescriptions)
                .Include(o => o.ShipmentInfo)
                .Include(o => o.StatusHistories)
                .AsSplitQuery()
                .ProjectTo<CustomerOrderDto>(mapper.ConfigurationProvider)
                .FirstAsync(ct);

            // 17. Send order confirmation email to customer asynchronously (fire-and-forget)
            if (orderForEmail?.User != null && !string.IsNullOrWhiteSpace(orderForEmail.User.Email))
            {
                _ = Task.Run(async () =>
                {
                    // Build item list from `result` — already projected, no extra DB round-trip needed.
                    List<(string ProductName, int Quantity, decimal Price)> items = result.Items
                        .Select(oi => (
                            ProductName: oi.ProductName ?? "Unknown Product",
                            Quantity: oi.Quantity,
                            Price: oi.UnitPrice))
                        .ToList();

                    OrderEmailBreakdownDto breakdown = new()
                    {
                        SubtotalAmount = result.TotalAmount,
                        DiscountAmount = result.DiscountApplied ?? 0m,
                        ShippingFee = result.ShippingFee,
                        FinalAmount = result.FinalAmount
                    };

                    await emailService.SendOrderConfirmationEmailAsync(
                        orderForEmail.User.Email,
                        result.Id.ToString(),
                        orderForEmail.User.DisplayName ?? orderForEmail.User.Email,
                        items,
                        breakdown,
                        CancellationToken.None);
                }, ct);
            }

            return Result<CustomerOrderDto>.Success(result);
        }
    }
}

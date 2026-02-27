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

public sealed class CreateStaffOrder
{
    public sealed class Command : IRequest<Result<StaffOrderDto>>
    {
        public required CreateStaffOrderDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<StaffOrderDto>>
    {
        public async Task<Result<StaffOrderDto>> Handle(Command request, CancellationToken ct)
        {
            CreateStaffOrderDto dto = request.Dto;
            Guid staffUserId = userAccessor.GetUserId();

            // idempotency: generate ID upfront so a post-commit retry does not create a duplicate order.
            Guid orderId = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

            // ExecuteAsync returns only the new Order ID after commit.
            // The re-query (ProjectTo) runs OUTSIDE the retry scope so a transient failure
            // there cannot retry the whole transaction and create duplicate orders.
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
                // then both insert, exceeding the limit. Serializable blocks the second reader.
                await using IDbContextTransaction transaction =
                    await context.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

                // 1. Validate OrderSource + Address logic
                if (dto.OrderSource == OrderSource.Online && dto.AddressId == null)
                    return Result<Guid>.Failure("Address is required for online orders.", 400);

                if (dto.OrderSource == OrderSource.Online && dto.AddressId != null)
                {
                    // If UserId provided → validate address belongs to that customer
                    if (dto.UserId.HasValue)
                    {
                        bool addressBelongsToUser = await context.Addresses
                            .AnyAsync(a => a.Id == dto.AddressId && a.UserId == dto.UserId && !a.IsDeleted, ct);
                        if (!addressBelongsToUser)
                            return Result<Guid>.Failure("Address not found or does not belong to the specified customer.", 404);
                    }
                    else
                    {
                        bool addressExists = await context.Addresses
                            .AnyAsync(a => a.Id == dto.AddressId && !a.IsDeleted, ct);
                        if (!addressExists)
                            return Result<Guid>.Failure("Address not found.", 404);
                    }
                }

                // 2. Validate Prescription requirement
                if (dto.OrderType == OrderType.Prescription && dto.Prescription == null)
                    return Result<Guid>.Failure("Prescription details are required for prescription orders.", 400);

                // 3. Validate items and stock
                if (dto.Items.Count == 0)
                    return Result<Guid>.Failure("Order must have at least one item.", 400);

                // Merge duplicate ProductVariantId entries to prevent DB unique constraint violation
                // and ensure aggregate stock check is correct
                List<OrderItemInputDto> mergedItems = dto.Items
                    .GroupBy(i => i.ProductVariantId)
                    .Select(g => new OrderItemInputDto
                    {
                        ProductVariantId = g.Key,
                        Quantity = g.Sum(i => i.Quantity),
                    })
                    .ToList();

                List<Guid> variantIds = mergedItems.Select(i => i.ProductVariantId).ToList();
                List<ProductVariant> variants = await context.ProductVariants
                    .Include(pv => pv.Product)
                    .Where(pv => variantIds.Contains(pv.Id))
                    .ToListAsync(ct);

                if (variants.Count != variantIds.Distinct().Count())
                    return Result<Guid>.Failure("One or more product variants not found.", 404);

                // Load stocks with UPDLOCK to prevent race condition on reservation
                string paramList = string.Join(", ", variantIds.Select((_, i) => $"@p{i}"));
                object[] sqlParams = variantIds
                    .Select((id, i) => (object)new SqlParameter($"@p{i}", id)).ToArray();

                await context.Stocks
                    .FromSqlRaw($"SELECT * FROM Stocks WITH (UPDLOCK) WHERE ProductVariantId IN ({paramList})", sqlParams)
                    .ToListAsync(ct);
                // EF Core relationship fixup auto-links variant.Stock

                // Validate stock for ReadyStock orders
                if (dto.OrderType == OrderType.ReadyStock)
                {
                    foreach (OrderItemInputDto item in mergedItems)
                    {
                        ProductVariant variant = variants.First(v => v.Id == item.ProductVariantId);
                        if (!variant.IsActive)
                            return Result<Guid>.Failure($"Product variant '{variant.VariantName}' is not available.", 400);

                        if (variant.Stock == null || variant.Stock.QuantityAvailable < item.Quantity)
                            return Result<Guid>.Failure(
                                $"Insufficient stock for '{variant.VariantName}'. Available: {variant.Stock?.QuantityAvailable ?? 0}.", 400);
                    }
                }

                // 4. Calculate totals
                decimal totalAmount = 0;
                List<OrderItem> orderItems = new List<OrderItem>();

                foreach (OrderItemInputDto item in mergedItems)
                {
                    ProductVariant variant = variants.First(v => v.Id == item.ProductVariantId);
                    decimal unitPrice = variant.Price;
                    totalAmount += unitPrice * item.Quantity;

                    orderItems.Add(new OrderItem
                    {
                        ProductVariantId = item.ProductVariantId,
                        Quantity = item.Quantity,
                        UnitPrice = unitPrice,
                        OrderId = Guid.Empty // Will be set after order creation
                    });
                }

                decimal shippingFee = dto.OrderSource == OrderSource.Offline ? 0 : 0; // TODO: Calculate shipping fee for online orders

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

                    // Check usage limit
                    if (promotion.UsageLimit.HasValue)
                    {
                        int usedCount = await context.PromoUsageLogs
                            .CountAsync(l => l.PromotionId == promotion.Id, ct);
                        if (usedCount >= promotion.UsageLimit.Value)
                            return Result<Guid>.Failure("Promo code usage limit reached.", 400);
                    }

                    // Check min order amount
                    // Note: Add MinOrderAmount check here if field is added to Promotion entity

                    // Calculate discount
                    discountApplied = promotion.PromotionType switch
                    {
                        PromotionType.Percentage => Math.Round(totalAmount * promotion.DiscountValue / 100, 2),
                        PromotionType.FixedAmount => promotion.DiscountValue,
                        _ => 0
                    };

                    // Cap discount at max discount value
                    if (promotion.MaxDiscountValue.HasValue && discountApplied > promotion.MaxDiscountValue.Value)
                        discountApplied = promotion.MaxDiscountValue.Value;

                    // Discount cannot exceed order total
                    if (discountApplied > totalAmount)
                        discountApplied = totalAmount;
                }

                // 6. Create Order
                Order order = new Order
                {
                    Id = orderId, // explicitly assigned from outside retry scope
                    OrderSource = dto.OrderSource,
                    OrderType = dto.OrderType,
                    OrderStatus = OrderStatus.Pending,
                    UserId = dto.UserId, // null = walk-in, Guid = on-behalf registered customer
                    CreatedBySalesStaff = staffUserId,
                    AddressId = dto.OrderSource == OrderSource.Offline ? null : dto.AddressId,
                    TotalAmount = totalAmount,
                    ShippingFee = shippingFee,
                    CustomerNote = dto.CustomerNote,
                    WalkInCustomerName = dto.WalkInCustomerName,
                    WalkInCustomerPhone = dto.WalkInCustomerPhone,
                    CancellationDeadline = dto.OrderType == OrderType.Prescription
                        ? DateTime.UtcNow.AddHours(24)
                        : null,
                };

                context.Orders.Add(order);

                // 7. Assign OrderId to items and add
                foreach (OrderItem item in orderItems)
                {
                    item.OrderId = order.Id;
                }
                context.OrderItems.AddRange(orderItems);

                // 8. Reserve stock for ReadyStock orders
                if (dto.OrderType == OrderType.ReadyStock)
                {
                    foreach (OrderItemInputDto item in mergedItems)
                    {
                        Stock stock = variants.First(v => v.Id == item.ProductVariantId).Stock!;
                        stock.QuantityReserved += item.Quantity;
                        stock.UpdatedAt = DateTime.UtcNow;
                        stock.UpdatedBy = staffUserId;
                    }
                }

                // 9. Create Payment
                Payment payment = new Payment
                {
                    OrderId = order.Id,
                    PaymentMethod = dto.PaymentMethod,
                    Amount = totalAmount + shippingFee - discountApplied,
                    PaymentStatus = dto.PaymentMethod == PaymentMethod.Cash
                        ? PaymentStatus.Completed
                        : PaymentStatus.Pending,
                    PaymentAt = dto.PaymentMethod == PaymentMethod.Cash
                        ? DateTime.UtcNow
                        : null,
                    PaymentType = PaymentType.Full,
                };
                context.Payments.Add(payment);

                // 10. Create Promo Usage Log
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

                // 11. Create Prescription
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

                // 12. Create initial status history
                context.OrderStatusHistories.Add(new OrderStatusHistory
                {
                    OrderId = order.Id,
                    FromStatus = OrderStatus.Pending,
                    ToStatus = OrderStatus.Pending,
                    Notes = $"Order created by staff ({dto.OrderSource})",
                    ChangedBy = staffUserId,
                });

                // 13. Save
                bool success = await context.SaveChangesAsync(ct) > 0;

                if (!success)
                    return Result<Guid>.Failure("Failed to create order.", 500);

                await transaction.CommitAsync(ct);

                // Return only the ID — re-query happens outside the retry scope.
                return Result<Guid>.Success(order.Id);
            });

            if (!transactionResult.IsSuccess)
                return Result<StaffOrderDto>.Failure(transactionResult.Error!, transactionResult.Code);

            // 14. Re-query with ProjectTo for consistent response (outside retry delegate).
            // If this fails it does NOT retry the transaction.
            StaffOrderDto result = await context.Orders
                .Where(o => o.Id == transactionResult.Value)
                .ProjectTo<StaffOrderDto>(mapper.ConfigurationProvider)
                .FirstAsync(ct);

            return Result<StaffOrderDto>.Success(result);
        }
    }
}

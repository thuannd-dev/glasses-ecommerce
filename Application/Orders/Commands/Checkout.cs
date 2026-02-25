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
            // Use RepeatableRead to prevent promo usage limit race condition
            await using IDbContextTransaction transaction =
                await context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, ct);

            CheckoutDto dto = request.Dto;
            Guid userId = userAccessor.GetUserId();

            // 1. Get active cart with items
            Cart? cart = await context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId
                    && c.Status == CartStatus.Active, ct);

            if (cart == null || cart.Items.Count == 0)
                return Result<CustomerOrderDto>.Failure("Cart is empty.", 400);

            // 2. Validate address
            bool addressExists = await context.Addresses
                .AnyAsync(a => a.Id == dto.AddressId
                    && a.UserId == userId && !a.IsDeleted, ct);

            if (!addressExists)
                return Result<CustomerOrderDto>.Failure("Address not found.", 404);

            // 3. Validate variants and stock
            List<Guid> variantIds = cart.Items.Select(i => i.ProductVariantId).ToList();
            List<ProductVariant> variants = await context.ProductVariants
                .Include(pv => pv.Product)
                .Where(pv => variantIds.Contains(pv.Id))
                .ToListAsync(ct);

            if (variants.Count != variantIds.Distinct().Count())
                return Result<CustomerOrderDto>.Failure("One or more products are no longer available.", 400);

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
                foreach (CartItem cartItem in cart.Items)
                {
                    ProductVariant variant = variants.First(v => v.Id == cartItem.ProductVariantId);
                    if (!variant.IsActive)
                        return Result<CustomerOrderDto>.Failure(
                            $"Product '{variant.VariantName}' is no longer available.", 400);

                    if (variant.Stock == null || variant.Stock.QuantityAvailable < cartItem.Quantity)
                        return Result<CustomerOrderDto>.Failure(
                            $"Insufficient stock for '{variant.VariantName}'. Available: {variant.Stock?.QuantityAvailable ?? 0}.", 400);
                }
            }

            // 4. Calculate totals
            decimal totalAmount = 0;
            List<OrderItem> orderItems = new List<OrderItem>();

            foreach (CartItem cartItem in cart.Items)
            {
                ProductVariant variant = variants.First(v => v.Id == cartItem.ProductVariantId);
                decimal unitPrice = variant.Price;
                totalAmount += unitPrice * cartItem.Quantity;

                orderItems.Add(new OrderItem
                {
                    ProductVariantId = cartItem.ProductVariantId,
                    Quantity = cartItem.Quantity,
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
                    return Result<CustomerOrderDto>.Failure("Invalid or expired promo code.", 400);

                if (promotion.UsageLimit.HasValue)
                {
                    int usedCount = await context.PromoUsageLogs
                        .CountAsync(l => l.PromotionId == promotion.Id, ct);
                    if (usedCount >= promotion.UsageLimit.Value)
                        return Result<CustomerOrderDto>.Failure("Promo code usage limit reached.", 400);
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

            // 8. Reserve stock
            if (dto.OrderType == OrderType.ReadyStock)
            {
                foreach (CartItem cartItem in cart.Items)
                {
                    Stock stock = variants.First(v => v.Id == cartItem.ProductVariantId).Stock!;
                    stock.QuantityReserved += cartItem.Quantity;
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

            // 13. Clear cart after checkout
            cart.Status = CartStatus.Converted;

            // 14. Save
            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<CustomerOrderDto>.Failure("Failed to place order.", 500);

            await transaction.CommitAsync(ct);

            // 15. Re-query with ProjectTo
            CustomerOrderDto result = await context.Orders
                .Where(o => o.Id == order.Id)
                .ProjectTo<CustomerOrderDto>(mapper.ConfigurationProvider)
                .FirstAsync(ct);

            return Result<CustomerOrderDto>.Success(result);
        }
    }
}

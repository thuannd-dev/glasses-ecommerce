using Application.Core;
using Application.Interfaces;
using Application.Promotions.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Promotions.Queries;

public sealed class ValidatePromoCode
{
    public sealed class Query : IRequest<Result<PromoValidationResultDto>>
    {
        public required ValidatePromoCodeDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IUserAccessor userAccessor) : IRequestHandler<Query, Result<PromoValidationResultDto>>
    {
        public async Task<Result<PromoValidationResultDto>> Handle(Query request, CancellationToken ct)
        {
            ValidatePromoCodeDto dto = request.Dto;
            Guid userId = userAccessor.GetUserId();

            DateTime now = DateTime.UtcNow;
            Promotion? promotion = await context.Promotions
                .AsNoTracking()
                .FirstOrDefaultAsync(p =>
                    p.PromoCode == dto.PromoCode.ToUpper() &&
                    p.IsActive &&
                    p.ValidFrom <= now &&
                    p.ValidTo >= now, ct);

            if (promotion == null)
                return Result<PromoValidationResultDto>.Success(new PromoValidationResultDto
                {
                    IsValid = false,
                    Error = "Invalid or expired promo code.",
                });

            // Global usage limit
            if (promotion.UsageLimit.HasValue)
            {
                int usedCount = await context.PromoUsageLogs
                    .CountAsync(l => l.PromotionId == promotion.Id, ct);
                if (usedCount >= promotion.UsageLimit.Value)
                    return Result<PromoValidationResultDto>.Success(new PromoValidationResultDto
                    {
                        IsValid = false,
                        Error = "Promo code usage limit reached.",
                    });
            }

            // Per-customer limit (only when authenticated)
            if (promotion.UsageLimitPerCustomer.HasValue)
            {
                int customerUsed = await context.PromoUsageLogs
                    .CountAsync(l => l.PromotionId == promotion.Id && l.UsedBy == userId, ct);
                if (customerUsed >= promotion.UsageLimitPerCustomer.Value)
                    return Result<PromoValidationResultDto>.Success(new PromoValidationResultDto
                    {
                        IsValid = false,
                        Error = "You have already used this promo code the maximum number of times.",
                    });
            }

            // Calculate discount
            decimal discountApplied = promotion.PromotionType switch
            {
                PromotionType.Percentage => Math.Round(dto.OrderTotal * promotion.DiscountValue / 100, 2),
                PromotionType.FixedAmount => Math.Min(promotion.DiscountValue, dto.OrderTotal),
                PromotionType.FreeShipping => dto.ShippingFee,
                _ => 0
            };

            if (promotion.MaxDiscountValue.HasValue && discountApplied > promotion.MaxDiscountValue.Value)
                discountApplied = promotion.MaxDiscountValue.Value;

            // Only cap at OrderTotal for non-FreeShipping types
            if (promotion.PromotionType != PromotionType.FreeShipping && discountApplied > dto.OrderTotal)
                discountApplied = dto.OrderTotal;

            return Result<PromoValidationResultDto>.Success(new PromoValidationResultDto
            {
                IsValid = true,
                DiscountApplied = discountApplied,
                PromotionType = promotion.PromotionType.ToString(),
                PromoName = promotion.PromoName,
            });
        }
    }
}

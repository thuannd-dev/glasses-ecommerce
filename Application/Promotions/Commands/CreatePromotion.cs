using Application.Core;
using Application.Promotions.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Promotions.Commands;

public sealed class CreatePromotion
{
    public sealed class Command : IRequest<Result<PromotionDetailDto>>
    {
        public required CreatePromotionDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Command, Result<PromotionDetailDto>>
    {
        public async Task<Result<PromotionDetailDto>> Handle(Command request, CancellationToken ct)
        {
            CreatePromotionDto dto = request.Dto;

            bool codeExists = await context.Promotions
                .AnyAsync(p => p.PromoCode == dto.PromoCode.ToUpper(), ct);
            if (codeExists)
                return Result<PromotionDetailDto>.Failure(
                    $"Promo code '{dto.PromoCode}' already exists.", 409);

            Promotion promotion = new Promotion
            {
                PromoCode = dto.PromoCode.ToUpper(),
                PromoName = dto.PromoName,
                Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description,
                PromotionType = dto.PromotionType,
                DiscountValue = dto.DiscountValue,
                MaxDiscountValue = dto.MaxDiscountValue,
                UsageLimit = dto.UsageLimit,
                UsageLimitPerCustomer = dto.UsageLimitPerCustomer,
                ValidFrom = dto.ValidFrom,
                ValidTo = dto.ValidTo,
                IsActive = true,
                IsPublic = dto.IsPublic,
            };

            context.Promotions.Add(promotion);
            try
            {
                bool success = await context.SaveChangesAsync(ct) > 0;
                if (!success)
                    return Result<PromotionDetailDto>.Failure("Failed to create promotion.", 500);
            }
            catch (DbUpdateException)
            {
                bool duplicateCode = await context.Promotions
                    .AsNoTracking()
                    .AnyAsync(p => p.PromoCode == promotion.PromoCode, ct);

                if (duplicateCode)
                    return Result<PromotionDetailDto>.Failure(
                        $"Promo code '{dto.PromoCode}' already exists.", 409);

                return Result<PromotionDetailDto>.Failure("Failed to create promotion.", 500);
            }

            PromotionDetailDto result = await context.Promotions
                .AsNoTracking()
                .Where(p => p.Id == promotion.Id)
                .ProjectTo<PromotionDetailDto>(mapper.ConfigurationProvider)
                .FirstAsync(ct);

            return Result<PromotionDetailDto>.Success(result);
        }
    }
}

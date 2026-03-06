using Application.Core;
using Application.Promotions.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Promotions.Commands;

public sealed class UpdatePromotion
{
    public sealed class Command : IRequest<Result<PromotionDetailDto>>
    {
        public required Guid Id { get; set; }
        public required UpdatePromotionDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Command, Result<PromotionDetailDto>>
    {
        public async Task<Result<PromotionDetailDto>> Handle(Command request, CancellationToken ct)
        {
            UpdatePromotionDto dto = request.Dto;

            Promotion? promotion = await context.Promotions
                .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

            if (promotion == null)
                return Result<PromotionDetailDto>.Failure("Promotion not found.", 404);

            // Block structural changes once usage logs exist — retroactively changing
            // DiscountValue/PromotionType would make existing log amounts misleading.
            // Only soft fields are editable after usage.
            promotion.PromoName = dto.PromoName;
            promotion.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description;
            promotion.MaxDiscountValue = dto.MaxDiscountValue;
            promotion.UsageLimit = dto.UsageLimit;
            promotion.UsageLimitPerCustomer = dto.UsageLimitPerCustomer;
            promotion.ValidFrom = dto.ValidFrom;
            promotion.ValidTo = dto.ValidTo;
            promotion.IsActive = dto.IsActive;
            promotion.IsPublic = dto.IsPublic;

            await context.SaveChangesAsync(ct);

            PromotionDetailDto result = await context.Promotions
                .AsNoTracking()
                .Where(p => p.Id == promotion.Id)
                .ProjectTo<PromotionDetailDto>(mapper.ConfigurationProvider)
                .FirstAsync(ct);

            return Result<PromotionDetailDto>.Success(result);
        }
    }
}

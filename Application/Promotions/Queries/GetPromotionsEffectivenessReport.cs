using Application.Core;
using Application.Promotions.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Promotions.Queries;

public sealed class GetPromotionsEffectivenessReport
{
    public sealed class Query : IRequest<Result<PromotionEffectivenessReportDto>>
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<PromotionEffectivenessReportDto>>
    {
        public async Task<Result<PromotionEffectivenessReportDto>> Handle(Query request, CancellationToken ct)
        {
            // Promos có 0 usage phải xuất hiện -> Group Join or explicitly fetching Promos and aggregating filtered usage logs

            IQueryable<Promotion> promotionsQuery = context.Promotions.AsNoTracking();

            var stats = await promotionsQuery
                .Select(p => new
                {
                    Promo = p,
                    UsageLogs = p.UsageLogs.Where(u =>

                        (!request.FromDate.HasValue || u.UsedAt >= request.FromDate.Value) &&
                        (!request.ToDate.HasValue || u.UsedAt <= request.ToDate.Value))
                })
                .ToListAsync(ct);

            List<PromotionEffectivenessItemDto> items = stats.Select(s => new PromotionEffectivenessItemDto
            {
                PromotionId = s.Promo.Id,
                PromoCode = s.Promo.PromoCode,
                PromoName = s.Promo.PromoName,
                PromotionType = s.Promo.PromotionType.ToString(),
                DiscountValue = s.Promo.DiscountValue,
                IsActive = s.Promo.IsActive,
                ValidFrom = s.Promo.ValidFrom,
                ValidTo = s.Promo.ValidTo,
                UsageCount = s.UsageLogs.Count(),
                TotalDiscountApplied = s.UsageLogs.Sum(u => u.DiscountApplied)
            })
            .OrderByDescending(x => x.UsageCount)
            .ToList();

            PromotionEffectivenessReportDto result = new()
            {
                FromDate = request.FromDate,
                ToDate = request.ToDate,
                Items = items
            };

            return Result<PromotionEffectivenessReportDto>.Success(result);
        }
    }
}

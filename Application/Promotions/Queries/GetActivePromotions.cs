using Application.Core;
using Application.Promotions.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Promotions.Queries;

public sealed class GetActivePromotions
{
    public sealed class Query : IRequest<Result<List<ActivePromotionDto>>>
    {
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Query, Result<List<ActivePromotionDto>>>
    {
        public async Task<Result<List<ActivePromotionDto>>> Handle(Query request, CancellationToken ct)
        {
            DateTime now = DateTime.UtcNow;

            List<ActivePromotionDto> items = await context.Promotions
                .AsNoTracking()
                .Where(p => p.IsActive && p.IsPublic && p.ValidFrom <= now && p.ValidTo >= now)
                .OrderByDescending(p => p.ValidTo)
                .ProjectTo<ActivePromotionDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result<List<ActivePromotionDto>>.Success(items);
        }
    }
}

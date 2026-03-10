using Application.Core;
using Application.FeatureToggles.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.FeatureToggles.Queries;

public sealed class GetFeatureToggleList
{
    public sealed class Query : IRequest<Result<PagedResult<FeatureToggleDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public bool? IsEnabled { get; set; }
        public string? Scope { get; set; }
        public string? Search { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<PagedResult<FeatureToggleDto>>>
    {
        public async Task<Result<PagedResult<FeatureToggleDto>>> Handle(Query request, CancellationToken ct)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<FeatureToggleDto>>.Failure("Invalid pagination parameters.", 400);

            IQueryable<FeatureToggle> query = context.FeatureToggles.AsNoTracking();

            if (request.IsEnabled.HasValue)
                query = query.Where(ft => ft.IsEnabled == request.IsEnabled.Value);

            if (!string.IsNullOrWhiteSpace(request.Scope))
                query = query.Where(ft => ft.Scope == request.Scope);

            if (!string.IsNullOrWhiteSpace(request.Search))
                query = query.Where(ft => ft.FeatureName.Contains(request.Search));

            int totalCount = await query.CountAsync(ct);

            List<FeatureToggleDto> items = await query
                .OrderBy(ft => ft.FeatureName)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<FeatureToggleDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            PagedResult<FeatureToggleDto> result = new()
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<FeatureToggleDto>>.Success(result);
        }
    }
}

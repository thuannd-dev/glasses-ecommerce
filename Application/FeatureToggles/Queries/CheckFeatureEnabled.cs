using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Persistence;

namespace Application.FeatureToggles.Queries;

public sealed class CheckFeatureEnabled
{
    public sealed class Query : IRequest<Result<bool>>
    {
        public required string FeatureName { get; set; }
        public string? Scope { get; set; }
        public string? ScopeValue { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMemoryCache cache)
        : IRequestHandler<Query, Result<bool>>
    {
        public async Task<Result<bool>> Handle(Query request, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(request.FeatureName))
            {
                return Result<bool>.Failure("FeatureName is required.", 400);
            }

            string normFeatureName = request.FeatureName.Trim();
            string? normScope = string.IsNullOrWhiteSpace(request.Scope) ? null : request.Scope.Trim();
            string? normScopeValue = string.IsNullOrWhiteSpace(request.ScopeValue) ? null : request.ScopeValue.Trim();

            // Scope and ScopeValue must be paired
            if ((normScope == null) != (normScopeValue == null))
            {
                return Result<bool>.Failure("Scope and ScopeValue must be both provided or both omitted.", 400);
            }

            string cacheKey = $"FeatureToggle_{normFeatureName}_{normScope ?? "null"}_{normScopeValue ?? "null"}";

            if (cache.TryGetValue(cacheKey, out object? cachedResult) && cachedResult is bool cachedBool)
            {
                return Result<bool>.Success(cachedBool);
            }

            bool hasScope = normScope != null;

            // Fetch both the scoped toggle (if requested) and the global toggle (Scope=null) in one round-trip.
            // Resolution priority: Scoped > Global > false (fail-safe).
            List<FeatureToggle> candidates = await context.FeatureToggles
                .AsNoTracking()
                .Where(ft => ft.FeatureName == normFeatureName
                    && (ft.Scope == null
                        || (hasScope && ft.Scope == normScope && ft.ScopeValue == normScopeValue)))
                .ToListAsync(ct);

            DateTime utcNow = DateTime.UtcNow;

            // Filter candidates that are ACTUALLY effective right now
            var effectiveCandidates = candidates.Where(ft =>
                ft.IsEnabled
                && (ft.EffectiveFrom == null || ft.EffectiveFrom <= utcNow)
                && (ft.EffectiveTo == null || ft.EffectiveTo > utcNow)
            ).ToList();

            // Prefer the EFFECTIVE scoped record; fall back to the EFFECTIVE global one
            FeatureToggle? toggle = hasScope
                ? effectiveCandidates.FirstOrDefault(ft => ft.Scope == normScope && ft.ScopeValue == normScopeValue)
                    ?? effectiveCandidates.FirstOrDefault(ft => ft.Scope == null)
                : effectiveCandidates.FirstOrDefault(ft => ft.Scope == null);

            bool isEffective = toggle != null;

            // Find the nearest future date (EffectiveFrom or EffectiveTo) across all candidates to cap the cache TTL
            DateTime? nextTransition = candidates
                .SelectMany(ft => new[] { ft.EffectiveFrom, ft.EffectiveTo })
                .Where(d => d.HasValue && d.Value > utcNow)
                .Min();

            TimeSpan timeToLive = TimeSpan.FromMinutes(5);
            if (nextTransition.HasValue)
            {
                TimeSpan timeUntilTransition = nextTransition.Value - utcNow;
                if (timeUntilTransition < timeToLive)
                {
                    timeToLive = timeUntilTransition;
                }
            }

            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = timeToLive
            };
            cache.Set(cacheKey, isEffective, cacheOptions);

            return Result<bool>.Success(isEffective);
        }
    }
}

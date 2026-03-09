using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
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

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<bool>>
    {
        public async Task<Result<bool>> Handle(Query request, CancellationToken ct)
        {
            bool hasScope = !string.IsNullOrWhiteSpace(request.Scope);

            // Fetch both the scoped toggle (if requested) and the global toggle (Scope=null) in one round-trip.
            // Resolution priority: Scoped > Global > false (fail-safe).
            List<FeatureToggle> candidates = await context.FeatureToggles
                .AsNoTracking()
                .Where(ft => ft.FeatureName == request.FeatureName
                    && (ft.Scope == null
                        || (hasScope && ft.Scope == request.Scope && ft.ScopeValue == request.ScopeValue)))
                .ToListAsync(ct);

            // Prefer the scoped record; fall back to the global one
            FeatureToggle? toggle = hasScope
                ? candidates.FirstOrDefault(ft => ft.Scope == request.Scope && ft.ScopeValue == request.ScopeValue)
                    ?? candidates.FirstOrDefault(ft => ft.Scope == null)
                : candidates.FirstOrDefault(ft => ft.Scope == null);

            // Fail-safe default: feature is off when no toggle is configured
            if (toggle == null)
                return Result<bool>.Success(false);

            DateTime utcNow = DateTime.UtcNow;
            bool isEffective = toggle.IsEnabled
                && (toggle.EffectiveFrom == null || toggle.EffectiveFrom <= utcNow)
                && (toggle.EffectiveTo == null || toggle.EffectiveTo > utcNow);

            return Result<bool>.Success(isEffective);
        }
    }
}

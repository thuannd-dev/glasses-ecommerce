using Application.Core;
using Application.FeatureToggles.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.FeatureToggles.Commands;

public sealed class SetFeatureToggleEnabled
{
    public sealed class Command : IRequest<Result<FeatureToggleDto>>
    {
        public required Guid Id { get; set; }
        public bool IsEnabled { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor,
        Microsoft.Extensions.Caching.Memory.IMemoryCache cache) : IRequestHandler<Command, Result<FeatureToggleDto>>
    {
        public async Task<Result<FeatureToggleDto>> Handle(Command request, CancellationToken ct)
        {
            FeatureToggle? toggle = await context.FeatureToggles
                .FirstOrDefaultAsync(ft => ft.Id == request.Id, ct);

            if (toggle == null)
                return Result<FeatureToggleDto>.Failure("Feature toggle not found.", 404);

            toggle.IsEnabled = request.IsEnabled;
            toggle.UpdatedAt = DateTime.UtcNow;
            toggle.UpdatedBy = userAccessor.GetUserId();

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<FeatureToggleDto>.Failure("Failed to update feature toggle.", 500);

            string cacheKey = $"FeatureToggle_{toggle.FeatureName}_{toggle.Scope ?? "null"}_{toggle.ScopeValue ?? "null"}";
            cache.Remove(cacheKey);

            return Result<FeatureToggleDto>.Success(mapper.Map<FeatureToggleDto>(toggle));
        }
    }
}

using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Persistence;

namespace Application.FeatureToggles.Commands;

public sealed class DeleteFeatureToggle
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMemoryCache cache)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            FeatureToggle? toggle = await context.FeatureToggles
                .FirstOrDefaultAsync(ft => ft.Id == request.Id, ct);

            if (toggle == null)
                return Result<Unit>.Failure("Feature toggle not found.", 404);

            string cacheKey = $"FeatureToggle_{toggle.FeatureName}_{toggle.Scope ?? "null"}_{toggle.ScopeValue ?? "null"}";

            context.FeatureToggles.Remove(toggle);
            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Unit>.Failure("Failed to delete feature toggle.", 500);

            cache.Remove(cacheKey);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

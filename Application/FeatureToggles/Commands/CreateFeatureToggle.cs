using Application.Core;
using Application.FeatureToggles.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.FeatureToggles.Commands;

public sealed class CreateFeatureToggle
{
    public sealed class Command : IRequest<Result<FeatureToggleDto>>
    {
        public required CreateFeatureToggleDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor,
        Microsoft.Extensions.Caching.Memory.IMemoryCache cache) : IRequestHandler<Command, Result<FeatureToggleDto>>
    {
        public async Task<Result<FeatureToggleDto>> Handle(Command request, CancellationToken ct)
        {
            CreateFeatureToggleDto dto = request.Dto;

            if (dto.EffectiveTo.HasValue)
            {
                if (!dto.EffectiveFrom.HasValue)
                    return Result<FeatureToggleDto>.Failure("EffectiveFrom must be provided if EffectiveTo is set.", 400);

                if (dto.EffectiveTo <= dto.EffectiveFrom)
                    return Result<FeatureToggleDto>.Failure("EffectiveTo must be after EffectiveFrom.", 400);
            }

            string normFeatureName = request.Dto.FeatureName.Trim();
            string? normalizedScope = string.IsNullOrWhiteSpace(dto.Scope) ? null : dto.Scope.Trim();
            string? normalizedScopeValue = string.IsNullOrWhiteSpace(dto.ScopeValue) ? null : dto.ScopeValue.Trim();

            bool duplicateExists = await context.FeatureToggles
                .AnyAsync(ft => ft.FeatureName == normFeatureName
                    && ft.Scope == normalizedScope
                    && ft.ScopeValue == normalizedScopeValue, ct);

            if (duplicateExists)
            {
                string scopeLabel = normalizedScope == null
                    ? "global scope"
                    : $"scope '{normalizedScope}:{normalizedScopeValue}'";
                return Result<FeatureToggleDto>.Failure(
                    $"A feature toggle '{dto.FeatureName}' already exists for {scopeLabel}.", 409);
            }

            Guid userId = userAccessor.GetUserId();

            FeatureToggle toggle = new()
            {
                FeatureName = normFeatureName,
                IsEnabled = dto.IsEnabled,
                Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo,
                Scope = normalizedScope,
                ScopeValue = normalizedScopeValue,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = userId
            };

            context.FeatureToggles.Add(toggle);
            
            try
            {
                bool success = await context.SaveChangesAsync(ct) > 0;
                if (!success)
                    return Result<FeatureToggleDto>.Failure("Failed to create feature toggle.", 500);
            }
            catch (DbUpdateException ex) when (
                ex.InnerException?.Message.Contains("UX_FeatureToggle_FeatureName_Global", StringComparison.OrdinalIgnoreCase) == true ||
                ex.InnerException?.Message.Contains("UX_FeatureToggle_FeatureName_Scoped", StringComparison.OrdinalIgnoreCase) == true)
            {
                string scopeLabel = normalizedScope == null
                    ? "global scope"
                    : $"scope '{normalizedScope}:{normalizedScopeValue}'";
                return Result<FeatureToggleDto>.Failure(
                    $"A feature toggle '{dto.FeatureName}' already exists for {scopeLabel}.", 409);
            }

            string cacheKey = $"FeatureToggle_{toggle.FeatureName}_{toggle.Scope ?? "null"}_{toggle.ScopeValue ?? "null"}";
            cache.Remove(cacheKey);

            return Result<FeatureToggleDto>.Success(mapper.Map<FeatureToggleDto>(toggle));
        }
    }
}

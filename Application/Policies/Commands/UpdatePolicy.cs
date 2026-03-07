using Application.Core;
using Application.Interfaces;
using Application.Policies.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Policies.Commands;

public sealed class UpdatePolicy
{
    public sealed class Command : IRequest<Result<PolicyConfigurationDto>>
    {
        public Guid Id { get; set; }
        public required UpdatePolicyDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<PolicyConfigurationDto>>
    {
        public async Task<Result<PolicyConfigurationDto>> Handle(Command request, CancellationToken ct)
        {
            var strategy = context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);

            PolicyConfiguration? policy = await context.PolicyConfigurations
                .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

            if (policy == null) return Result<PolicyConfigurationDto>.Failure("Policy not found", 404);
            if (policy.IsDeleted) return Result<PolicyConfigurationDto>.Failure("Cannot update a deleted policy.", 400);

            UpdatePolicyDto dto = request.Dto;

            // Cross-field Validation
            if (policy.PolicyType == PolicyType.Return && !dto.ReturnWindowDays.HasValue)
            {
                return Result<PolicyConfigurationDto>.Failure("ReturnWindowDays is required for Return policies.", 400);
            }
            if (policy.PolicyType != PolicyType.Return && dto.ReturnWindowDays.HasValue)
            {
                return Result<PolicyConfigurationDto>.Failure("ReturnWindowDays must be null for non-Return policies.", 400);
            }

            if (policy.PolicyType == PolicyType.Warranty && !dto.WarrantyMonths.HasValue)
            {
                return Result<PolicyConfigurationDto>.Failure("WarrantyMonths is required for Warranty policies.", 400);
            }
            if (policy.PolicyType != PolicyType.Warranty && dto.WarrantyMonths.HasValue)
            {
                return Result<PolicyConfigurationDto>.Failure("WarrantyMonths must be null for non-Warranty policies.", 400);
            }

            // Basic Date Validation
            if (dto.EffectiveTo.HasValue && dto.EffectiveTo <= dto.EffectiveFrom)
            {
                return Result<PolicyConfigurationDto>.Failure("EffectiveTo must be greater than EffectiveFrom.", 400);
            }

            // Date Overlap Validation (only if it's being set to active, or dates are changing)
            if (dto.IsActive)
            {
                DateTime pStart = dto.EffectiveFrom;
                DateTime pEnd = dto.EffectiveTo ?? DateTime.MaxValue;

                bool isOverlap = await context.PolicyConfigurations
                    .Where(p => p.PolicyType == policy.PolicyType && p.Id != policy.Id && p.IsActive && !p.IsDeleted)
                    .AnyAsync(existing => 
                        pStart <= (existing.EffectiveTo ?? DateTime.MaxValue) && 
                        pEnd >= existing.EffectiveFrom, ct);

                if (isOverlap)
                {
                    return Result<PolicyConfigurationDto>.Failure(
                        $"Cannot update policy. The effective dates overlap with an existing active policy for type {policy.PolicyType}.", 409);
                }
            }

            // Apply updates
            policy.PolicyName = dto.PolicyName;
            policy.ReturnWindowDays = dto.ReturnWindowDays;
            policy.WarrantyMonths = dto.WarrantyMonths;
            policy.RefundAllowed = dto.RefundAllowed;
            policy.CustomizedLensRefundable = dto.CustomizedLensRefundable;
            policy.EvidenceRequired = dto.EvidenceRequired;
            policy.MinOrderAmount = dto.MinOrderAmount;
            policy.IsActive = dto.IsActive;
            policy.EffectiveFrom = dto.EffectiveFrom;
            policy.EffectiveTo = dto.EffectiveTo;
            
            policy.UpdatedAt = DateTime.UtcNow;
            policy.UpdatedBy = userAccessor.GetUserId();

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success) return Result<PolicyConfigurationDto>.Failure("Failed to update policy", 500);

            await transaction.CommitAsync(ct);
            PolicyConfigurationDto updatedDto = mapper.Map<PolicyConfigurationDto>(policy);
            return Result<PolicyConfigurationDto>.Success(updatedDto);
        });
        }
    }
}

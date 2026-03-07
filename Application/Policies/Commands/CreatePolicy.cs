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

public sealed class CreatePolicy
{
    public sealed class Command : IRequest<Result<PolicyConfigurationDto>>
    {
        public required CreatePolicyDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<PolicyConfigurationDto>>
    {
        public async Task<Result<PolicyConfigurationDto>> Handle(Command request, CancellationToken ct)
        {
            CreatePolicyDto dto = request.Dto;

            var strategy = context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);

            // Basic Date Validation
            if (dto.EffectiveTo.HasValue && dto.EffectiveTo <= dto.EffectiveFrom)
            {
                return Result<PolicyConfigurationDto>.Failure("EffectiveTo must be greater than EffectiveFrom.", 400);
            }

            // Date Overlap Validation (only if it's being set to active)
            if (dto.IsActive)
            {
                // Overlap condition: P.Start <= E.End && P.End >= E.Start
                DateTime pStart = dto.EffectiveFrom;
                DateTime pEnd = dto.EffectiveTo ?? DateTime.MaxValue;

                bool isOverlap = await context.PolicyConfigurations
                    .Where(p => p.PolicyType == dto.PolicyType && p.IsActive && !p.IsDeleted)
                    .AnyAsync(existing => 
                        pStart <= (existing.EffectiveTo ?? DateTime.MaxValue) && 
                        pEnd >= existing.EffectiveFrom, ct);

                if (isOverlap)
                {
                    return Result<PolicyConfigurationDto>.Failure(
                        $"Cannot create policy. The effective dates overlap with an existing active policy for type {dto.PolicyType}.", 409);
                }
            }

            PolicyConfiguration policy = new PolicyConfiguration
            {
                PolicyType = dto.PolicyType,
                PolicyName = dto.PolicyName,
                ReturnWindowDays = dto.ReturnWindowDays,
                WarrantyMonths = dto.WarrantyMonths,
                RefundAllowed = dto.RefundAllowed,
                CustomizedLensRefundable = dto.CustomizedLensRefundable,
                EvidenceRequired = dto.EvidenceRequired,
                MinOrderAmount = dto.MinOrderAmount,
                IsActive = dto.IsActive,
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo,
                CreatedBy = userAccessor.GetUserId()
            };

            context.PolicyConfigurations.Add(policy);
            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success) return Result<PolicyConfigurationDto>.Failure("Failed to create policy", 500);

            await transaction.CommitAsync(ct);
            PolicyConfigurationDto createdDto = mapper.Map<PolicyConfigurationDto>(policy);
            return Result<PolicyConfigurationDto>.Success(createdDto);
        });
        }
    }
}

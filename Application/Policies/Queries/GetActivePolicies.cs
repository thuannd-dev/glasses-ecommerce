using Application.Core;
using Application.Policies.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Policies.Queries;

public sealed class GetActivePolicies
{
    public sealed class Query : IRequest<Result<List<ActivePolicyDto>>>
    {
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, Result<List<ActivePolicyDto>>>
    {
        public async Task<Result<List<ActivePolicyDto>>> Handle(Query request, CancellationToken ct)
        {
            DateTime now = DateTime.UtcNow;

            List<ActivePolicyDto> policies = await context.PolicyConfigurations
                .Where(p => 
                    p.IsActive && 
                    !p.IsDeleted && 
                    p.EffectiveFrom <= now && 
                    (p.EffectiveTo == null || p.EffectiveTo >= now))
                .AsNoTracking()
                .OrderBy(p => p.PolicyType)
                .ProjectTo<ActivePolicyDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result<List<ActivePolicyDto>>.Success(policies);
        }
    }
}

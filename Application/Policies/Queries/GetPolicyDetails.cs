using Application.Core;
using Application.Policies.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Policies.Queries;

public sealed class GetPolicyDetails
{
    public sealed class Query : IRequest<Result<PolicyConfigurationDto>>
    {
        public Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, Result<PolicyConfigurationDto>>
    {
        public async Task<Result<PolicyConfigurationDto>> Handle(Query request, CancellationToken ct)
        {
            PolicyConfigurationDto? policy = await context.PolicyConfigurations
                .Where(p => p.Id == request.Id)
                .AsNoTracking()
                .ProjectTo<PolicyConfigurationDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (policy == null) return Result<PolicyConfigurationDto>.Failure("Policy not found", 404);

            return Result<PolicyConfigurationDto>.Success(policy);
        }
    }
}

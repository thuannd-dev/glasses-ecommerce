using Application.Core;
using Application.Policies.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Policies.Queries;

public sealed class GetPolicyList
{
    public sealed class Query : IRequest<Result<PagedResult<PolicyConfigurationDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public PolicyType? PolicyType { get; set; }
        public bool? IsActive { get; set; }
        public string? Search { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, Result<PagedResult<PolicyConfigurationDto>>>
    {
        public async Task<Result<PagedResult<PolicyConfigurationDto>>> Handle(Query request, CancellationToken ct)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<PolicyConfigurationDto>>.Failure("Invalid pagination parameters.", 400);

            IQueryable<PolicyConfiguration> query = context.PolicyConfigurations
                .AsNoTracking();

            if (request.PolicyType.HasValue)
            {
                query = query.Where(p => p.PolicyType == request.PolicyType.Value);
            }

            if (request.IsActive.HasValue)
            {
                query = query.Where(p => p.IsActive == request.IsActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                query = query.Where(p => p.PolicyName.Contains(request.Search));
            }

            int totalCount = await query.CountAsync(ct);

            List<PolicyConfigurationDto> items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<PolicyConfigurationDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result<PagedResult<PolicyConfigurationDto>>.Success(new PagedResult<PolicyConfigurationDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            });
        }
    }
}

using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetMyOrders
{
    public sealed class Query : IRequest<Result<PagedResult<CustomerOrderListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<PagedResult<CustomerOrderListDto>>>
    {
        public async Task<Result<PagedResult<CustomerOrderListDto>>> Handle(Query request, CancellationToken ct)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<CustomerOrderListDto>>
                    .Failure("Invalid pagination parameters.", 400);

            Guid userId = userAccessor.GetUserId();

            IQueryable<Domain.Order> query = context.Orders
                .AsNoTracking()
                .Where(o => o.UserId == userId);

            int totalCount = await query.CountAsync(ct);

            List<CustomerOrderListDto> orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<CustomerOrderListDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            PagedResult<CustomerOrderListDto> result = new()
            {
                Items = orders,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<CustomerOrderListDto>>.Success(result);
        }
    }
}

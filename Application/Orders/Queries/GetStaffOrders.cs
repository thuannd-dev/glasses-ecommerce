using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetStaffOrders
{
    public sealed class Query : IRequest<Result<PagedResult<StaffOrderListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<PagedResult<StaffOrderListDto>>>
    {
        public async Task<Result<PagedResult<StaffOrderListDto>>> Handle(Query request, CancellationToken ct)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<StaffOrderListDto>>
                    .Failure("Invalid pagination parameters.", 400);

            Guid staffUserId = userAccessor.GetUserId();

            IQueryable<Domain.Order> query = context.Orders
                .Where(o => o.CreatedBySalesStaff == staffUserId);

            int totalCount = await query.CountAsync(ct);

            List<StaffOrderListDto> orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<StaffOrderListDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            PagedResult<StaffOrderListDto> result = new()
            {
                Items = orders,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<StaffOrderListDto>>.Success(result);
        }
    }
}

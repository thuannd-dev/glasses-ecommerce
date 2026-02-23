using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public class GetMyOrders
{
    public class Query : IRequest<Result<List<CustomerOrderListDto>>> { }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<CustomerOrderListDto>>>
    {
        public async Task<Result<List<CustomerOrderListDto>>> Handle(Query request, CancellationToken ct)
        {
            Guid userId = userAccessor.GetUserId();

            var orders = await context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ProjectTo<CustomerOrderListDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result<List<CustomerOrderListDto>>.Success(orders);
        }
    }
}

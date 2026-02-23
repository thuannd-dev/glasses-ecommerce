using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public class GetStaffOrders
{
    public class Query : IRequest<Result<List<StaffOrderListDto>>> { }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<StaffOrderListDto>>>
    {
        public async Task<Result<List<StaffOrderListDto>>> Handle(Query request, CancellationToken ct)
        {
            Guid staffUserId = userAccessor.GetUserId();

            var orders = await context.Orders
                .Where(o => o.CreatedBySalesStaff == staffUserId)
                .OrderByDescending(o => o.CreatedAt)
                .ProjectTo<StaffOrderListDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result<List<StaffOrderListDto>>.Success(orders);
        }
    }
}

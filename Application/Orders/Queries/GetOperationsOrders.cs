using Application.Core;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetOperationsOrders
{
    public sealed class Query : IRequest<Result<List<StaffOrderListDto>>>
    {
        public OrderStatus? Status { get; set; }
        public OrderType? OrderType { get; set; }
        public OrderSource? OrderSource { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<List<StaffOrderListDto>>>
    {
        public async Task<Result<List<StaffOrderListDto>>> Handle(Query request, CancellationToken ct)
        {
            IQueryable<Order> query = context.Orders.AsNoTracking();

            if (request.Status.HasValue)
                query = query.Where(o => o.OrderStatus == request.Status.Value);

            if (request.OrderType.HasValue)
                query = query.Where(o => o.OrderType == request.OrderType.Value);

            if (request.OrderSource.HasValue)
                query = query.Where(o => o.OrderSource == request.OrderSource.Value);

            List<StaffOrderListDto> orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .ProjectTo<StaffOrderListDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result<List<StaffOrderListDto>>.Success(orders);
        }
    }
}

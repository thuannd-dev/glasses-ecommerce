using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Queries;

public sealed class GetOrderItemsForReplacement
{
    public sealed class Query : IRequest<List<OrderItemOutputDto>>
    {
        public required Guid OrderId { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Query, List<OrderItemOutputDto>>
    {
        public async Task<List<OrderItemOutputDto>> Handle(Query request, CancellationToken ct)
        {
            List<OrderItemOutputDto> items = await context.OrderItems
                .AsNoTracking()
                .Where(oi => oi.OrderId == request.OrderId)
                .Include(oi => oi.ProductVariant!)
                    .ThenInclude(pv => pv!.Product)
                .ProjectTo<OrderItemOutputDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return items;
        }
    }
}

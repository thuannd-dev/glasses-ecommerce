using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetMyOrderDetail
{
    public sealed class Query : IRequest<Result<CustomerOrderDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<CustomerOrderDto>>
    {
        public async Task<Result<CustomerOrderDto>> Handle(Query request, CancellationToken ct)
        {
            Guid userId = userAccessor.GetUserId();

            var order = await context.Orders
                .Where(o => o.Id == request.Id && o.UserId == userId)
                .ProjectTo<CustomerOrderDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (order == null)
                return Result<CustomerOrderDto>.Failure("Order not found.", 404);

            return Result<CustomerOrderDto>.Success(order);
        }
    }
}

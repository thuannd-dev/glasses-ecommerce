using Application.Core;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetOperationsOrderDetail
{
    public sealed class Query : IRequest<Result<StaffOrderDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<StaffOrderDto>>
    {
        public async Task<Result<StaffOrderDto>> Handle(Query request, CancellationToken ct)
        {
            StaffOrderDto? order = await context.Orders
                .Where(o => o.Id == request.Id)
                .ProjectTo<StaffOrderDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (order == null)
                return Result<StaffOrderDto>.Failure("Order not found.", 404);

            return Result<StaffOrderDto>.Success(order);
        }
    }
}

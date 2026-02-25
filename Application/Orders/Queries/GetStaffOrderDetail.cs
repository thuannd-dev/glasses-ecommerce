using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetStaffOrderDetail
{
    public sealed class Query : IRequest<Result<StaffOrderDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<StaffOrderDto>>
    {
        public async Task<Result<StaffOrderDto>> Handle(Query request, CancellationToken ct)
        {
            Guid staffUserId = userAccessor.GetUserId();

            var order = await context.Orders
                .Where(o => o.Id == request.Id && o.CreatedBySalesStaff == staffUserId)
                .ProjectTo<StaffOrderDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (order == null)
                return Result<StaffOrderDto>.Failure("Order not found.", 404);

            return Result<StaffOrderDto>.Success(order);
        }
    }
}

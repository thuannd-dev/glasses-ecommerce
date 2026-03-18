using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
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
        public string? Status { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<PagedResult<CustomerOrderListDto>>>
    {
        public async Task<Result<PagedResult<CustomerOrderListDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<CustomerOrderListDto>>
                    .Failure("Invalid pagination parameters.", 400);

            Guid userId = userAccessor.GetUserId();

            IQueryable<Domain.Order> query = context.Orders
                .AsNoTracking()
                .Where(o => o.UserId == userId);

            // Apply status filter if provided
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                string[] statusNames = request.Status.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                List<OrderStatus> statusEnums = [];
                foreach (string statusName in statusNames)
                {
                    if (Enum.TryParse<OrderStatus>(statusName, ignoreCase: true, out OrderStatus statusEnum))
                    {
                        statusEnums.Add(statusEnum);
                    }
                }

                if (statusEnums.Count == 0)
                {
                    return Result<PagedResult<CustomerOrderListDto>>
                         .Failure("No valid status values provided.", 400);
                }

                query = query.Where(o => statusEnums.Contains(o.OrderStatus));
            }

            int totalCount = await query.CountAsync(cancellationToken);

            List<CustomerOrderListDto> orders = await query
                .Include(o => o.Prescriptions)
                    .ThenInclude(p => p.Details)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv!.Product)
                .Include(o => o.Address)
                .Include(o => o.PromoUsageLogs)
                .OrderByDescending(o => o.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<CustomerOrderListDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

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

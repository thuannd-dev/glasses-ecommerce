using Application.Core;
using Application.Orders.DTOs;
using Application.Products.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetOperationQueueOrders
{
    public sealed class Query : IRequest<Result<PagedResult<OrderListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public OrderStatus FilterStatus { get; set; } = OrderStatus.Confirmed;
        public string? CustomerEmail { get; set; }
        public OrderType? Type { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public sealed class Handler(AppDbContext context) 
        : IRequestHandler<Query, Result<PagedResult<OrderListDto>>>
    {
        public async Task<Result<PagedResult<OrderListDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .Where(o => o.OrderStatus == request.FilterStatus)
                .AsQueryable();

            // Filter by customer email
            if (!string.IsNullOrWhiteSpace(request.CustomerEmail))
            {
                query = query.Where(o => o.User != null && o.User.Email != null && 
                    EF.Functions.Like(o.User.Email, $"%{request.CustomerEmail}%"));
            }

            // Filter by order type
            if (request.Type.HasValue)
            {
                query = query.Where(o => o.OrderType == request.Type.Value);
            }

            // Filter by date range
            if (request.FromDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                var toDateEndOfDay = request.ToDate.Value.AddDays(1);
                query = query.Where(o => o.CreatedAt < toDateEndOfDay);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(o => new OrderListDto
                {
                    Id = o.Id,
                    OrderNumber = $"ORD-{o.Id.ToString().Substring(0, 8).ToUpper()}",
                    CustomerEmail = o.User!.Email ?? "N/A",
                    CustomerName = o.User!.DisplayName ?? "Guest Customer",
                    TotalAmount = o.CalculateFinalAmount(),
                    OrderType = o.OrderType,
                    OrderStatus = o.OrderStatus,
                    CreatedAt = o.CreatedAt,
                    OrderSource = o.OrderSource,
                    ItemCount = o.OrderItems.Count
                })
                .ToListAsync(cancellationToken);

            var result = new PagedResult<OrderListDto>
            {
                Items = orders,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<OrderListDto>>.Success(result);
        }
    }
}

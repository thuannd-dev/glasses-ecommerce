using Application.Core;
using Application.Orders.DTOs;
using Application.Products.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetOrderList
{
    public sealed class Query : IRequest<Result<PagedResult<OrderListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? CustomerEmail { get; set; }
        public OrderStatus? Status { get; set; }
        public OrderType? Type { get; set; }
        public OrderSource? Source { get; set; }
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
                .AsQueryable();

            // Filter by customer email
            if (!string.IsNullOrWhiteSpace(request.CustomerEmail))
            {
                query = query.Where(o => o.User != null && o.User.Email != null && 
                    EF.Functions.Like(o.User.Email, $"%{request.CustomerEmail}%"));
            }

            // Filter by status
            if (request.Status.HasValue)
            {
                query = query.Where(o => o.OrderStatus == request.Status.Value);
            }

            // Filter by type
            if (request.Type.HasValue)
            {
                query = query.Where(o => o.OrderType == request.Type.Value);
            }

            // Filter by source
            if (request.Source.HasValue)
            {
                query = query.Where(o => o.OrderSource == request.Source.Value);
            }

            // Filter by date range
            if (request.FromDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                // Add 1 day to include the entire ToDate day
                var toDateInclusive = request.ToDate.Value.AddDays(1);
                query = query.Where(o => o.CreatedAt < toDateInclusive);
            }

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination and ordering
            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var orderDtos = orders.Select(o => new OrderListDto
            {
                Id = o.Id,
                OrderNumber = $"ORD-{o.Id.ToString().Substring(0, 8).ToUpper()}",
                CustomerEmail = o.User?.Email ?? "N/A",
                CustomerName = o.User?.DisplayName ?? "Guest Customer",
                TotalAmount = o.CalculateFinalAmount(),
                OrderType = o.OrderType,
                OrderStatus = o.OrderStatus,
                CreatedAt = o.CreatedAt,
                OrderSource = o.OrderSource,
                ItemCount = o.OrderItems.Count
            }).ToList();

            var result = new PagedResult<OrderListDto>
            {
                Items = orderDtos,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<OrderListDto>>.Success(result);
        }
    }
}

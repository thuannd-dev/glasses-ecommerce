using Application.Core;
using Application.Orders.DTOs;
using Application.Products.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetInProductionOrders
{
    public sealed record Query : IRequest<Result<PagedResult<OrderListDto>>>
    {
        public required int PageNumber { get; init; }
        public required int PageSize { get; init; }
        public string? CustomerEmail { get; init; }
        public OrderType? Type { get; init; }
        public DateTime? FromDate { get; init; }
        public DateTime? ToDate { get; init; }
    }

    internal sealed class Handler(AppDbContext context) : IRequestHandler<Query, Result<PagedResult<OrderListDto>>>
    {
        public async Task<Result<PagedResult<OrderListDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .Where(o => o.OrderStatus == OrderStatus.InProduction || o.OrderStatus == OrderStatus.ReadyToPack || o.OrderStatus == OrderStatus.Packed)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.CustomerEmail))
                query = query.Where(o => o.User != null && o.User.Email != null && 
                    EF.Functions.Like(o.User.Email, $"%{request.CustomerEmail}%"));

            if (request.Type.HasValue)
                query = query.Where(o => o.OrderType == request.Type);

            if (request.FromDate.HasValue)
                query = query.Where(o => o.CreatedAt >= request.FromDate);

            if (request.ToDate.HasValue)
                query = query.Where(o => o.CreatedAt <= request.ToDate);

            var totalCount = await query.CountAsync(cancellationToken);
            var pageNumber = Math.Max(1, request.PageNumber);
            var pageSize = Math.Min(100, Math.Max(1, request.PageSize));

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
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

            return Result<PagedResult<OrderListDto>>.Success(new PagedResult<OrderListDto>
            {
                Items = orders,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }
    }
}


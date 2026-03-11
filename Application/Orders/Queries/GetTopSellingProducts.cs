using Application.Core;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetTopSellingProducts
{
    public sealed class Query : IRequest<Result<TopProductsReportDto>>
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int TopN { get; set; } = 10;
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<TopProductsReportDto>>
    {
        public async Task<Result<TopProductsReportDto>> Handle(Query request, CancellationToken ct)
        {
            if (request.TopN < 1 || request.TopN > 50)
                return Result<TopProductsReportDto>.Failure("TopN must be between 1 and 50.", 400);

            IQueryable<Order> ordersQuery = context.Orders
                .AsNoTracking()
                .Where(o => o.OrderStatus == OrderStatus.Completed);

            if (request.FromDate.HasValue)
                ordersQuery = ordersQuery.Where(o => o.CreatedAt >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                ordersQuery = ordersQuery.Where(o => o.CreatedAt <= request.ToDate.Value);

            List<TopProductItemDto> items = await context.OrderItems
                .AsNoTracking()
                .Where(oi => ordersQuery.Select(o => o.Id).Contains(oi.OrderId))
                .GroupBy(oi => oi.ProductVariantId)
                .Select(g => new TopProductItemDto
                {
                    ProductId = g.First().ProductVariant.ProductId,
                    ProductName = g.First().ProductVariant.Product.ProductName,
                    Brand = g.First().ProductVariant.Product.Brand,
                    ProductType = g.First().ProductVariant.Product.Type.ToString(),
                    VariantId = g.Key,
                    VariantName = g.First().ProductVariant.VariantName,
                    Sku = g.First().ProductVariant.SKU,
                    TotalQuantitySold = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                    OrderCount = g.Select(oi => oi.OrderId).Distinct().Count()
                })
                .OrderByDescending(x => x.TotalQuantitySold)
                .Take(request.TopN)
                .ToListAsync(ct);

            // Assign Rank
            items = items.Select((item, index) => 
            { 
                item.Rank = index + 1; 
                return item; 
            }).ToList();

            TopProductsReportDto result = new()
            {
                FromDate = request.FromDate.GetValueOrDefault(DateTime.MinValue),
                ToDate = request.ToDate.GetValueOrDefault(DateTime.MaxValue),
                TopN = request.TopN,
                Items = items
            };

            return Result<TopProductsReportDto>.Success(result);
        }
    }
}

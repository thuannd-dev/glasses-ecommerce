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

            var itemsRaw = await context.OrderItems
                .AsNoTracking()
                .Where(oi => ordersQuery.Select(o => o.Id).Contains(oi.OrderId))
                .GroupBy(oi => oi.ProductVariantId)
                .Select(g => new 
                {
                    ProductId = g.First().ProductVariant.ProductId,
                    ProductName = g.First().ProductVariant.Product.ProductName,
                    Brand = g.First().ProductVariant.Product.Brand,
                    ProductType = g.First().ProductVariant.Product.Type,
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

            List<TopProductItemDto> items = itemsRaw.Select(x => new TopProductItemDto
            {
                ProductId = x.ProductId,
                ProductName = x.ProductName,
                Brand = x.Brand,
                ProductType = x.ProductType.ToString(),
                VariantId = x.VariantId,
                VariantName = x.VariantName,
                Sku = x.Sku,
                TotalQuantitySold = x.TotalQuantitySold,
                TotalRevenue = x.TotalRevenue,
                OrderCount = x.OrderCount
            }).ToList();

            // Assign Rank
            items = items.Select((item, index) => 
            { 
                item.Rank = index + 1; 
                return item; 
            }).ToList();

            TopProductsReportDto result = new()
            {
                FromDate = request.FromDate,
                ToDate = request.ToDate,
                TopN = request.TopN,
                Items = items
            };

            return Result<TopProductsReportDto>.Success(result);
        }
    }
}

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

            if (request.FromDate.HasValue && request.ToDate.HasValue && request.FromDate.Value > request.ToDate.Value)
                return Result<TopProductsReportDto>.Failure("FromDate cannot be later than ToDate.", 400);

            IQueryable<Order> ordersQuery = context.Orders
                .AsNoTracking()
                .Where(o => o.OrderStatus == OrderStatus.Completed);

            if (request.FromDate.HasValue)
                ordersQuery = ordersQuery.Where(o => o.CreatedAt >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                ordersQuery = ordersQuery.Where(o => o.CreatedAt <= request.ToDate.Value);

            var topVariantsQuery = ordersQuery
                .SelectMany(o => o.OrderItems)
                .GroupBy(oi => oi.ProductVariantId)
                .Select(g => new 
                {
                    VariantId = g.Key,
                    TotalQuantitySold = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                    OrderCount = g.Select(oi => oi.OrderId).Distinct().Count()
                })
                .OrderByDescending(x => x.TotalQuantitySold)
                .Take(request.TopN);

            var itemsRaw = await topVariantsQuery
                .Join(context.ProductVariants, 
                    g => g.VariantId, 
                    pv => pv.Id, 
                    (g, pv) => new 
                    {
                        ProductId = pv.ProductId,
                        ProductName = pv.Product.ProductName,
                        Brand = pv.Product.Brand,
                        ProductType = pv.Product.Type,
                        VariantId = g.VariantId,
                        VariantName = pv.VariantName,
                        Sku = pv.SKU,
                        TotalQuantitySold = g.TotalQuantitySold,
                        TotalRevenue = g.TotalRevenue,
                        OrderCount = g.OrderCount
                    })
                .OrderByDescending(x => x.TotalQuantitySold)
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

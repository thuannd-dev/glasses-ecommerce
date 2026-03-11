using Application.Core;
using Application.Inventory.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Inventory.Queries;

public sealed class GetInventoryStatusReport
{
    public sealed class Query : IRequest<Result<InventoryStatusReportDto>>
    {
        public int LowStockThreshold { get; set; } = 10;
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<InventoryStatusReportDto>>
    {
        public async Task<Result<InventoryStatusReportDto>> Handle(Query request, CancellationToken ct)
        {
            if (request.LowStockThreshold < 1 || request.LowStockThreshold > 500)
                return Result<InventoryStatusReportDto>.Failure("LowStockThreshold must be between 1 and 500.", 400);

            var summary = await context.Stocks
                .AsNoTracking()
                .GroupBy(s => 1)
                .Select(g => new
                {
                    TotalSKUs = g.Count(),
                    TotalOnHand = g.Sum(s => s.QuantityOnHand),
                    TotalAvailable = g.Sum(s => s.QuantityAvailable),
                    LowStockCount = g.Count(s => s.QuantityAvailable < request.LowStockThreshold),
                    OutOfStockCount = g.Count(s => s.QuantityAvailable == 0)
                })
                .FirstOrDefaultAsync(ct);

            if (summary == null)
            {
                return Result<InventoryStatusReportDto>.Success(new InventoryStatusReportDto());
            }

            List<LowStockItemDto> lowStockItems = await context.Stocks
                .AsNoTracking()
                .Where(s => s.QuantityAvailable < request.LowStockThreshold)
                .OrderBy(s => s.QuantityAvailable)
                .Select(s => new LowStockItemDto
                {
                    ProductId = s.ProductVariant.ProductId,
                    ProductName = s.ProductVariant.Product.ProductName,
                    Brand = s.ProductVariant.Product.Brand,
                    VariantId = s.ProductVariantId,
                    VariantName = s.ProductVariant.VariantName,
                    Sku = s.ProductVariant.SKU,
                    QuantityOnHand = s.QuantityOnHand,
                    QuantityReserved = s.QuantityReserved,
                    QuantityAvailable = s.QuantityAvailable,
                    QuantityPreOrdered = s.QuantityPreOrdered
                })
                .ToListAsync(ct);

            InventoryStatusReportDto result = new()
            {
                TotalSKUs = summary.TotalSKUs,
                TotalOnHand = summary.TotalOnHand,
                TotalAvailable = summary.TotalAvailable,
                LowStockCount = summary.LowStockCount,
                OutOfStockCount = summary.OutOfStockCount,
                LowStockItems = lowStockItems
            };

            return Result<InventoryStatusReportDto>.Success(result);
        }
    }
}

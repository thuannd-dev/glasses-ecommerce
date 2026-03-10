using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Queries;

public sealed class GetAllProductsForReplacement
{
    public sealed class Query : IRequest<List<OrderItemOutputDto>>
    {
    }

    internal sealed class Handler(
        AppDbContext context) : IRequestHandler<Query, List<OrderItemOutputDto>>
    {
        public async Task<List<OrderItemOutputDto>> Handle(Query request, CancellationToken ct)
        {
            // Get all product variants and map them as replacement options
            List<OrderItemOutputDto> items = await context.ProductVariants
                .AsNoTracking()
                .Where(pv => pv.Product.Status == ProductStatus.Active)
                .Include(pv => pv.Product)
                .Select(pv => new OrderItemOutputDto
                {
                    Id = pv.Id,
                    ProductVariantId = pv.Id,
                    Sku = pv.SKU,
                    VariantName = pv.VariantName,
                    ProductName = pv.Product.ProductName,
                    Quantity = 1,
                    UnitPrice = pv.Price,
                    TotalPrice = pv.Price,
                    ProductImageUrl = pv.Product.Images.FirstOrDefault()!.ImageUrl
                })
                .ToListAsync(ct);

            return items;
        }
    }
}

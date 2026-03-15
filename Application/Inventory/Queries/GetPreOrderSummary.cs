using Application.Core;
using Application.Inventory.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Inventory.Queries;

public sealed class GetPreOrderSummary
{
    public sealed class Query : IRequest<Result<PreOrderSummaryResponseDto>>
    {
        /// <summary>
        /// Filter: chỉ hiển thị variant có QuantityPreOrdered > 0 hoặc IsPreOrder = true
        /// true = show all IsPreOrder variants, false = only show those with pending demand
        /// </summary>
        public bool IncludeEmptyPreOrders { get; set; } = false;
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<PreOrderSummaryResponseDto>>
    {
        public async Task<Result<PreOrderSummaryResponseDto>> Handle(Query request, CancellationToken ct)
        {
            // Get all stocks with pre-order info
            List<PreOrderSummaryItemDto> items = await context.Stocks
                .AsNoTracking()
                .Include(s => s.ProductVariant)
                .ThenInclude(pv => pv.Product)
                .Where(s => s.ProductVariant.IsPreOrder || s.QuantityPreOrdered > 0)
                .Select(s => new PreOrderSummaryItemDto
                {
                    ProductId = s.ProductVariant.ProductId,
                    ProductName = s.ProductVariant.Product.ProductName,
                    Brand = s.ProductVariant.Product.Brand,
                    VariantId = s.ProductVariantId,
                    VariantName = s.ProductVariant.VariantName,
                    Sku = s.ProductVariant.SKU,
                    QuantityPreOrdered = s.QuantityPreOrdered,
                    QuantityReserved = s.QuantityReserved,
                    IsPreOrderVariant = s.ProductVariant.IsPreOrder
                })
                .ToListAsync(ct);

            // Filter: exclude empty pre-orders if not requested
            if (!request.IncludeEmptyPreOrders)
            {
                items = items.Where(x => x.QuantityPreOrdered > 0).ToList();
            }

            // Sort by pending quantity descending
            items = items
                .OrderByDescending(x => x.QuantityPending)
                .ThenBy(x => x.ProductName)
                .ThenBy(x => x.VariantName)
                .ToList();

            if (items.Count == 0)
            {
                return Result<PreOrderSummaryResponseDto>.Success(new PreOrderSummaryResponseDto());
            }

            PreOrderSummaryResponseDto response = new()
            {
                TotalPreOrderVariants = items.Count(x => x.IsPreOrderVariant),
                TotalPreOrderDemand = items.Sum(x => x.QuantityPreOrdered),
                TotalFulfilledQuantity = items.Sum(x => x.QuantityReserved),
                Items = items
            };

            return Result<PreOrderSummaryResponseDto>.Success(response);
        }
    }
}

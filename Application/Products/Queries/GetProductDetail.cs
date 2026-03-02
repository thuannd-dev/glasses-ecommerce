using Application.Core;
using Application.Products.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Queries;

/// <summary>
/// Retrieves detailed product information with optimized query execution.
/// Uses AsSplitQuery to prevent Cartesian explosion when loading multiple collections (Variants, Images).
/// ProjectTo ensures only required columns are selected, reducing bandwidth and memory usage.
/// </summary>
public sealed class GetProductDetail
{
    public sealed class Query : IRequest<Result<ProductDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper) 
        : IRequestHandler<Query, Result<ProductDto>>
    {
        public async Task<Result<ProductDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            // Query execution order:
            // 1. Disable change tracking for read-only operation (AsNoTracking)
            // 2. Filter by ID (Where)
            // 3. Split query hint to prevent Cartesian explosion (AsSplitQuery)
            // 4. Project to DTO with only required columns (ProjectTo)
            ProductDto? product = await context.Products
                .AsNoTracking()
                .Where(p => p.Id == request.Id)
                .AsSplitQuery()
                .ProjectTo<ProductDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (product == null)
            {
                return Result<ProductDto>.Failure("Product not found.", 404);
            }

            return Result<ProductDto>.Success(product);
        }
    }
}

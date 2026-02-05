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
            // 1. Filter by ID (Where)
            // 2. Split query hint to prevent Cartesian explosion (AsSplitQuery)
            // 3. Project to DTO with only required columns (ProjectTo)
            // 4. Disable change tracking for read-only operation (AsNoTracking)
            var product = await context.Products
                .Where(p => p.Id == request.Id)
                .AsSplitQuery()
                .ProjectTo<ProductDto>(mapper.ConfigurationProvider)
                .AsNoTracking()
                .FirstOrDefaultAsync(cancellationToken);

            if (product == null)
            {
                return Result<ProductDto>.Failure("Product not found.", 404);
            }

            return Result<ProductDto>.Success(product);
        }
    }
}

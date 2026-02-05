using System.Text.Json.Serialization;
using Application.Core;
using Application.Products.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Queries;

/// <summary>
/// Retrieves paginated list of products with filtering and sorting.
/// Uses optimized queries with ProjectTo for minimal data transfer.
/// Price filtering/sorting considers only active variants for accuracy.
/// </summary>
public sealed class GetProductList
{
    public enum SortByOption
    {
        CreatedAt,
        Price,
        Name
    }

    public enum SortOrderOption
    {
        Asc,
        Desc
    }

    public sealed class Query : IRequest<Result<PagedResult<ProductListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public List<Guid>? CategoryIds { get; set; }
        public string? Brand { get; set; }
        public ProductStatus? Status { get; set; }
        public ProductType? Type { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? SearchTerm { get; set; }
        
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public SortByOption SortBy { get; set; } = SortByOption.CreatedAt;
        
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public SortOrderOption SortOrder { get; set; } = SortOrderOption.Desc;
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper) 
        : IRequestHandler<Query, Result<PagedResult<ProductListDto>>>
    {
        public async Task<Result<PagedResult<ProductListDto>>> Handle(
            Query request, 
            CancellationToken cancellationToken)
        {
            IQueryable<Product> query = context.Products.AsQueryable();

            // Apply filters
            query = ApplyFilters(query, request);

            // Get total count after filtering
            int totalCount = await query.CountAsync(cancellationToken);

            // Apply sorting
            query = ApplySorting(query, request);

            // Apply pagination and projection
            // ProjectTo generates optimized SQL SELECT based on ProductListDto mapping
            // AsSplitQuery prevents Cartesian explosion with multiple collections
            List<ProductListDto> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .AsSplitQuery()
                .ProjectTo<ProductListDto>(mapper.ConfigurationProvider)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            PagedResult<ProductListDto> pagedResult = new()
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<ProductListDto>>.Success(pagedResult);
        }

        private static IQueryable<Product> ApplyFilters(IQueryable<Product> query, Query request)
        {
            // Category filter
            if (request.CategoryIds is { Count: > 0 })
            {
                query = query.Where(p => request.CategoryIds.Contains(p.CategoryId));
            }

            // Brand filter (case-insensitive LIKE)
            if (!string.IsNullOrWhiteSpace(request.Brand))
            {
                string brandPattern = $"%{request.Brand}%";
                query = query.Where(p => p.Brand != null && EF.Functions.Like(p.Brand, brandPattern));
            }

            // Status filter (default to Active)
            ProductStatus statusFilter = request.Status ?? ProductStatus.Active;
            query = query.Where(p => p.Status == statusFilter);

            // IMPORTANT: Ensure product has at least one active variant
            // This prevents edge cases in price sorting where products without active variants
            // would get default price (0) and appear in incorrect positions
            query = query.Where(p => p.Variants.Any(v => v.IsActive));

            // Type filter
            if (request.Type.HasValue)
            {
                query = query.Where(p => p.Type == request.Type.Value);
            }

            // Search term filter (matches ProductName, Description, or Brand)
            // Case-insensitive by default in SQL Server
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                string searchPattern = $"%{request.SearchTerm}%";
                query = query.Where(p => 
                    EF.Functions.Like(p.ProductName, searchPattern) ||
                    (p.Description != null && EF.Functions.Like(p.Description, searchPattern)) ||
                    (p.Brand != null && EF.Functions.Like(p.Brand, searchPattern))
                );
            }

            // Price range filter (only considers active variants)
            if (request.MinPrice.HasValue || request.MaxPrice.HasValue)
            {
                query = query.Where(p => 
                    p.Variants.Any(v => v.IsActive &&
                        (!request.MinPrice.HasValue || v.Price >= request.MinPrice.Value) &&
                        (!request.MaxPrice.HasValue || v.Price <= request.MaxPrice.Value)
                    )
                );
            }

            return query;
        }

        private static IQueryable<Product> ApplySorting(IQueryable<Product> query, Query request)
        {
            // Use Min() for cleaner and more performant price sorting
            // All products are guaranteed to have at least one active variant at this point
            return request.SortBy switch
            {
                SortByOption.Price => request.SortOrder == SortOrderOption.Asc
                    ? query.OrderBy(p => p.Variants.Where(v => v.IsActive).Min(v => v.Price))
                    : query.OrderByDescending(p => p.Variants.Where(v => v.IsActive).Min(v => v.Price)),
                
                SortByOption.Name => request.SortOrder == SortOrderOption.Asc
                    ? query.OrderBy(p => p.ProductName)
                    : query.OrderByDescending(p => p.ProductName),
                
                _ => request.SortOrder == SortOrderOption.Asc
                    ? query.OrderBy(p => p.CreatedAt)
                    : query.OrderByDescending(p => p.CreatedAt)
            };
        }
    }
}

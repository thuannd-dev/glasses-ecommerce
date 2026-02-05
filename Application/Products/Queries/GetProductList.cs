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

    public sealed class Handler(AppDbContext context, IMapper mapper) 
        : IRequestHandler<Query, Result<PagedResult<ProductListDto>>>
    {
        public async Task<Result<PagedResult<ProductListDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = context.Products.AsQueryable();

            // Apply filters
            if (request.CategoryIds != null && request.CategoryIds.Count > 0)
            {
                query = query.Where(p => request.CategoryIds.Contains(p.CategoryId));
            }

            if (!string.IsNullOrWhiteSpace(request.Brand))
            {
                string brandPattern = $"%{request.Brand}%";
                query = query.Where(p => p.Brand != null && EF.Functions.Like(p.Brand, brandPattern));
            }

            // Default to Active if no status specified
            var statusFilter = request.Status ?? ProductStatus.Active;
            query = query.Where(p => p.Status == statusFilter);

            // IMPORTANT: Ensure product has at least one active variant when needed
            // (required for price-based filtering and sorting to avoid default price edge cases)
            if (statusFilter == ProductStatus.Active 
                || request.MinPrice.HasValue 
                || request.MaxPrice.HasValue 
                || request.SortBy == SortByOption.Price)
            {
                query = query.Where(p => p.Variants.Any(v => v.IsActive));
            }

            if (request.Type.HasValue)
            {
                query = query.Where(p => p.Type == request.Type.Value);
            }

            //Remind that SearchTerm can match ProductName, Description, or Brand
            //In this case, we use SQL Server so it's case-insensitive by default
            //But in some databases, you might need to use functions to ensure case-insensitivity
            //Ex: case-sensitive in PostgreSQL
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                string searchPattern = $"%{request.SearchTerm}%";
                query = query.Where(p => 
                    EF.Functions.Like(p.ProductName, searchPattern) ||
                    (p.Description != null && EF.Functions.Like(p.Description, searchPattern)) ||
                    (p.Brand != null && EF.Functions.Like(p.Brand, searchPattern))
                );
            }

            // Price range filtering (based on active variant prices)
            if (request.MinPrice.HasValue || request.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Variants.Any(v => 
                    v.IsActive &&
                    (!request.MinPrice.HasValue || v.Price >= request.MinPrice.Value) &&
                    (!request.MaxPrice.HasValue || v.Price <= request.MaxPrice.Value)
                ));
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply sorting
            query = request.SortBy switch
            {
                SortByOption.Price => request.SortOrder == SortOrderOption.Asc
                    ? query.OrderBy(p => p.Variants.Any(v => v.IsActive) ? p.Variants.Where(v => v.IsActive).Min(v => v.Price) : decimal.MaxValue)
                    : query.OrderByDescending(p => p.Variants.Any(v => v.IsActive) ? p.Variants.Where(v => v.IsActive).Min(v => v.Price) : decimal.MinValue),
                SortByOption.Name => request.SortOrder == SortOrderOption.Asc
                    ? query.OrderBy(p => p.ProductName)
                    : query.OrderByDescending(p => p.ProductName),
                _ => request.SortOrder == SortOrderOption.Asc
                    ? query.OrderBy(p => p.CreatedAt)
                    : query.OrderByDescending(p => p.CreatedAt)
            };

            // Apply pagination and projection
            // ProjectTo generates optimized SQL SELECT with scalar subqueries (no collections to split)
            ProductListDto[] items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<ProductListDto>(mapper.ConfigurationProvider)
                .AsNoTracking()
                .ToArrayAsync(cancellationToken);

            var pagedResult = new PagedResult<ProductListDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<ProductListDto>>.Success(pagedResult);
        }
    }
}

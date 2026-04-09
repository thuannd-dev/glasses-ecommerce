using Application.Core;
using Application.Products.DTOs;
using Application.Products.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[AllowAnonymous]
[Route("api/products")]
public sealed class ProductsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductListDto>>> GetProducts(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] List<Guid>? categoryIds = null,
        [FromQuery] string? brand = null,
        [FromQuery] ProductStatus? status = null,
        [FromQuery] ProductType? type = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? search = null,
        [FromQuery] GetProductList.SortByOption sortBy = GetProductList.SortByOption.CreatedAt,
        [FromQuery] GetProductList.SortOrderOption sortOrder = GetProductList.SortOrderOption.Desc,
        [FromQuery] bool includeLenses = false)
    {
        // Only allow managers and admins to include lenses in product listings
        bool canIncludeLenses = User.IsInRole("Manager") || User.IsInRole("Admin");

        return HandleResult(await Mediator.Send(new GetProductList.Query
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            CategoryIds = categoryIds,
            Brand = brand,
            Status = status,
            Type = type,
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            SearchTerm = search,
            SortBy = sortBy,
            SortOrder = sortOrder,
            IncludeLenses = canIncludeLenses && includeLenses
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetProductDetail.Query { Id = id }));
    }

    // ───────────────────── LENS BROWSING ─────────────────────────

    /// <summary>
    /// Lấy danh sách tròng kính (lens) tương thích với một frame.
    /// Optional: lọc theo toa mắt (sphOD, cylOD, sphOS, cylOS) để chỉ hiện variants
    /// có range quang học bao phủ được cả 2 mắt của khách.
    /// </summary>
    [HttpGet("{id}/compatible-lenses")]
    public async Task<ActionResult<List<CompatibleLensDto>>> GetCompatibleLenses(
        Guid id,
        [FromQuery] decimal? sphOD = null,
        [FromQuery] decimal? cylOD = null,
        [FromQuery] decimal? sphOS = null,
        [FromQuery] decimal? cylOS = null,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(new GetCompatibleLenses.Query
        {
            FrameProductId = id,
            SphOD = sphOD,
            CylOD = cylOD,
            SphOS = sphOS,
            CylOS = cylOS,
        }, ct));
    }

    /// <summary>
    /// Lấy danh sách coating options (UV, BlueLight...) của một Lens Product.
    /// Chỉ trả về các coating IsActive = true.
    /// </summary>
    [HttpGet("{id}/coating-options")]
    public async Task<ActionResult<List<LensCoatingOptionDto>>> GetLensCoatingOptions(
        Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetLensCoatingOptions.Query { LensProductId = id }, ct));
    }
}

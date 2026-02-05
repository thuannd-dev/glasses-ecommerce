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
        [FromQuery] GetProductList.SortOrderOption sortOrder = GetProductList.SortOrderOption.Desc)
    {
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
            SortOrder = sortOrder
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetProductDetail.Query { Id = id }));
    }
}

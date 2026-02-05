using Application.Categories.DTOs;
using Application.Categories.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[AllowAnonymous]
[Route("api/categories")]
public sealed class CategoriesController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<ProductCategoryDto>>> GetCategories()
    {
        return HandleResult(await Mediator.Send(new GetCategories.Query()));
    }
}

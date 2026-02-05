using Application.Products.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[AllowAnonymous]
[Route("api/brands")]
public sealed class BrandsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<string>>> GetBrands()
    {
        return HandleResult(await Mediator.Send(new GetBrands.Query()));
    }
}

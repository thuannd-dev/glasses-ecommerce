using Application.Carts.Commands;
using Application.Carts.DTOs;
using Application.Carts.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/carts")]
public sealed class CartsController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new GetCart.Query(), cancellationToken));
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemDto dto, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new AddItemToCart.Command { AddCartItemDto = dto }, cancellationToken));
    }

    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateItem(Guid id, UpdateCartItemDto dto, CancellationToken cancellationToken)
    {
        UpdateCartItem.Command command = new() 
        { 
            CartItemId = id, 
            UpdateCartItemDto = dto 
        };
        return HandleResult(await Mediator.Send(command, cancellationToken));
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new RemoveCartItem.Command { CartItemId = id }, cancellationToken));
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart(CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new ClearCart.Command(), cancellationToken));
    }
}

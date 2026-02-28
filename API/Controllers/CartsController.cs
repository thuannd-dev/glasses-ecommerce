using Application.Carts.Commands;
using Application.Carts.DTOs;
using Application.Carts.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/me/cart")]
public sealed class CartsController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new GetCart.Query(), cancellationToken));
    }

    /// <summary>
    /// Adds an item to the user's active cart.
    /// If the user does not currently have an active cart, a new one is automatically created.
    /// </summary>
    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemDto dto, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new AddItemToCart.Command { AddCartItemDto = dto }, cancellationToken));
    }

    [HttpPut("items/{id}")]
    public async Task<IActionResult> UpdateItem(Guid id, UpdateCartItemDto dto, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new UpdateCartItem.Command { CartItemId = id, UpdateCartItemDto = dto }, cancellationToken));
    }

    [HttpDelete("items/{id}")]
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

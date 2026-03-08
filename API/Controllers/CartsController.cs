using Application.Carts.Commands;
using Application.Carts.DTOs;
using Application.Carts.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/me/cart")]
public sealed class CartsController : BaseApiController
{
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new GetCart.Query(), cancellationToken));
    }

    /// <summary>
    /// Adds an item to the cart. Allows both authenticated and unauthenticated (anonymous) users.
    /// Authenticated users: item is added to their account cart.
    /// Unauthenticated users: cart is tracked via session (stored in browser cookies).
    /// </summary>
    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemDto dto, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new AddItemToCart.Command { AddCartItemDto = dto }, cancellationToken));
    }

    [Authorize]
    [HttpPut("items/{id}")]
    public async Task<IActionResult> UpdateItem(Guid id, UpdateCartItemDto dto, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new UpdateCartItem.Command { CartItemId = id, UpdateCartItemDto = dto }, cancellationToken));
    }

    [Authorize]
    [HttpDelete("items/{id}")]
    public async Task<IActionResult> RemoveItem(Guid id, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new RemoveCartItem.Command { CartItemId = id }, cancellationToken));
    }

    [Authorize]
    [HttpDelete]
    public async Task<IActionResult> ClearCart(CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new ClearCart.Command(), cancellationToken));
    }
}

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
        GetCart.Query query = new();
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemDto dto, CancellationToken cancellationToken)
    {
        AddItemToCart.Command command = new() { AddCartItemDto = dto };
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateItem(Guid id, UpdateCartItemDto dto, CancellationToken cancellationToken)
    {
        UpdateCartItem.Command command = new() 
        { 
            CartItemId = id, 
            UpdateCartItemDto = dto 
        };
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, CancellationToken cancellationToken)
    {
        RemoveCartItem.Command command = new() { CartItemId = id };
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart(CancellationToken cancellationToken)
    {
        ClearCart.Command command = new();
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }
}

using Application.Orders.Commands;
using Application.Orders.DTOs;
using Application.Orders.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/me/orders")]
public sealed class CustomerOrdersController : BaseApiController
{
    [HttpPost]
    public async Task<IActionResult> Checkout(CheckoutDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new Checkout.Command { Dto = dto }, ct));
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders(CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new GetMyOrders.Query(), ct));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMyOrderDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new GetMyOrderDetail.Query { Id = id }, ct));
    }
}

using Application.Orders.Commands;
using Application.Orders.DTOs;
using Application.Orders.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Operations")]
[Route("api/operations/orders")]
public sealed class OperationsOrdersController : BaseApiController
{
    //get all orders for operations (no staff filter)
    [HttpGet]
    public async Task<IActionResult> GetOrders(
        [FromQuery] OrderStatus? status,
        [FromQuery] OrderType? orderType,
        [FromQuery] OrderSource? orderSource,
        CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetOperationsOrders.Query
            {
                Status = status,
                OrderType = orderType,
                OrderSource = orderSource
            }, ct));
    }

    //get order detail for operations
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetOperationsOrderDetail.Query { Id = id }, ct));
    }

    //update order status (reuse existing handler)
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, UpdateOrderStatusDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new UpdateOrderStatus.Command { OrderId = id, Dto = dto }, ct));
    }
}

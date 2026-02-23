using Application.Orders.Commands;
using Application.Orders.DTOs;
using Application.Orders.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Sales")]
[Route("api/staff/orders")]
public sealed class StaffOrdersController : BaseApiController
{
    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateStaffOrderDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new CreateStaffOrder.Command { Dto = dto }, ct));
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders(CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new GetStaffOrders.Query(), ct));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new GetStaffOrderDetail.Query { Id = id }, ct));
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, UpdateOrderStatusDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new UpdateOrderStatus.Command { OrderId = id, Dto = dto }, ct));
    }
}

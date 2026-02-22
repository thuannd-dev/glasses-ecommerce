using Application.Orders.Commands;
using Application.Orders.DTOs;
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
}

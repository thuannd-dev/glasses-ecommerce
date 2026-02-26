using Application.Inventory.Commands;
using Application.Inventory.DTOs;
using Application.Inventory.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Manager")]
[Route("api/manager/inventory")]
public sealed class ManagerInventoryController : BaseApiController
{
    //xem danh sách phiếu nhập kho (reuse query — manager thấy tất cả)
    [HttpGet("inbound")]
    public async Task<IActionResult> GetInboundRecords(
        [FromQuery] InboundRecordStatus? status,
        CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetInboundRecords.Query { Status = status }, ct));
    }

    //xem chi tiết phiếu nhập kho (reuse query)
    [HttpGet("inbound/{id}")]
    public async Task<IActionResult> GetInboundDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetInboundDetail.Query { Id = id }, ct));
    }

    //duyệt phiếu nhập kho → cập nhật stock
    [HttpPut("inbound/{id}/approve")]
    public async Task<IActionResult> ApproveInbound(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new ApproveInbound.Command { InboundRecordId = id }, ct));
    }

    //từ chối phiếu nhập kho
    [HttpPut("inbound/{id}/reject")]
    public async Task<IActionResult> RejectInbound(Guid id, RejectInboundDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new RejectInbound.Command { InboundRecordId = id, Dto = dto }, ct));
    }
}

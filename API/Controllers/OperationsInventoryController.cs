using Application.Inventory.Commands;
using Application.Inventory.DTOs;
using Application.Inventory.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Operations")]
[Route("api/operations/inventory")]
public sealed class OperationsInventoryController : BaseApiController
{
    //record outbound transaction cho order (audit trail)
    [HttpPost("outbound")]
    public async Task<IActionResult> RecordOutbound(RecordOutboundDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new RecordOutbound.Command { Dto = dto }, ct));
    }

    //xem danh sách inventory transactions
    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] TransactionType? transactionType = null,
        [FromQuery] ReferenceType? referenceType = null,
        [FromQuery] Guid? productVariantId = null,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetInventoryTransactions.Query
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TransactionType = transactionType,
                ReferenceType = referenceType,
                ProductVariantId = productVariantId,
            }, ct));
    }

    //tạo phiếu nhập kho
    [HttpPost("inbound")]
    public async Task<IActionResult> CreateInbound(CreateInboundDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new CreateInbound.Command { Dto = dto }, ct));
    }

    //xem danh sách phiếu nhập kho
    [HttpGet("inbound")]
    public async Task<IActionResult> GetInboundRecords(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] InboundRecordStatus? status = null,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetInboundRecords.Query
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                Status = status
            }, ct));
    }

    //xem chi tiết phiếu nhập kho
    [HttpGet("inbound/{id}")]
    public async Task<IActionResult> GetInboundDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetInboundDetail.Query { Id = id }, ct));
    }
}

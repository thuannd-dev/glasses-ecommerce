using Application.AfterSales.Commands;
using Application.AfterSales.DTOs;
using Application.AfterSales.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Operations")]
[Route("api/operations/after-sales")]
public sealed class OperationsAfterSalesController : BaseApiController
{
    /// <summary>
    /// List all InProgress tickets requiring physical handling (excludes RefundOnly).
    /// Sorted so unrecorded receipts appear first.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetOpsTickets(
        [FromQuery] TicketResolutionType? resolutionType = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetOpsTickets.Query
            {
                ResolutionType = resolutionType,
                PageNumber = pageNumber,
                PageSize = pageSize
            }, ct));
    }

    /// <summary>
    /// Get full detail of a specific ticket.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTicketDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new GetStaffTicketDetail.Query { Id = id }, ct));
    }

    /// <summary>
    /// Confirm that the physical goods (returned/warranty item) have been received.
    /// Must be called before Inspect. Sets ReceivedAt timestamp.
    /// </summary>
    [HttpPut("{id}/receive")]
    public async Task<IActionResult> ReceiveReturn(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new ReceiveReturn.Command { TicketId = id }, ct));
    }

    /// <summary>
    /// Inspect received goods and decide accept or reject.
    /// CASE B (ReturnAndRefund, accepted): restores stock + creates Refund record.
    /// CASE D (WarrantyReplace, accepted): deducts stock for replacement unit.
    /// CASE C (WarrantyRepair, accepted): resolves ticket, no stock change.
    /// If rejected: ticket is closed with no stock or refund impact.
    /// </summary>
    [HttpPut("{id}/inspect")]
    public async Task<IActionResult> InspectReturn(Guid id, InspectReturnDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new InspectReturn.Command { TicketId = id, Dto = dto }, ct));
    }
}

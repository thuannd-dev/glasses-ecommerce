using Application.AfterSales.Commands;
using Application.AfterSales.DTOs;
using Application.AfterSales.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Sales")]
[Route("api/staff/after-sales")]
public sealed class StaffAfterSalesController : BaseApiController
{
    /// <summary>
    /// List all after-sales tickets with optional filters.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTickets(
        [FromQuery] AfterSalesTicketStatus? status = null,
        [FromQuery] AfterSalesTicketType? ticketType = null,
        [FromQuery] Guid? orderId = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetStaffTickets.Query
            {
                Status = status,
                TicketType = ticketType,
                OrderId = orderId,
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
    /// Approve a pending ticket and choose the resolution type.
    /// CASE A (RefundOnly): requires RefundAmount — resolves ticket immediately.
    /// CASE B/C/D: sets ticket to InProgress for Ops to handle physical goods.
    /// </summary>
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveTicket(Guid id, ApproveTicketDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new ApproveTicket.Command { TicketId = id, Dto = dto }, ct));
    }

    /// <summary>
    /// Reject a pending or in-progress ticket with a reason.
    /// </summary>
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> RejectTicket(Guid id, RejectTicketDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new RejectTicket.Command { TicketId = id, Dto = dto }, ct));
    }

    /// <summary>
    /// Ask the customer to upload additional evidence (photos/documents).
    /// Sets IsRequiredEvidence = true and moves ticket to InProgress.
    /// </summary>
    [HttpPut("{id}/request-evidence")]
    public async Task<IActionResult> RequestEvidence(Guid id, RequestEvidenceDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new RequestEvidence.Command { TicketId = id, Dto = dto }, ct));
    }
}

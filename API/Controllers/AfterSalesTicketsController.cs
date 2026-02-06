using Application.AfterSalesTickets.Commands;
using Application.AfterSalesTickets.DTOs;
using Application.AfterSalesTickets.Queries;
using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/tickets")]
[Authorize]
public sealed class AfterSalesTicketsController : BaseApiController
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<AfterSalesTicketListDto>>> GetTickets(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? customerEmail = null,
        [FromQuery] AfterSalesTicketType? type = null,
        [FromQuery] AfterSalesTicketStatus? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        return HandleResult(await Mediator.Send(new GetTicketList.Query
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            CustomerEmail = customerEmail,
            Type = type,
            Status = status,
            FromDate = fromDate,
            ToDate = toDate
        }));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<AfterSalesTicketDetailDto>> GetTicketDetail(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetTicketDetail.Query { TicketId = id }));
    }

    [HttpPut("{id}/status")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateTicketStatus(Guid id, [FromBody] UpdateTicketStatusRequest request)
    {
        return HandleResult(await Mediator.Send(new UpdateTicketStatusCommand.Command
        {
            TicketId = id,
            NewStatus = request.NewStatus,
            Notes = request.Notes,
            RefundAmount = request.RefundAmount
        }));
    }
}

public sealed class UpdateTicketStatusRequest
{
    public required AfterSalesTicketStatus NewStatus { get; set; }
    public string? Notes { get; set; }
    public decimal? RefundAmount { get; set; }
}

using Application.AfterSales.Commands;
using Application.AfterSales.DTOs;
using Application.AfterSales.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/me/after-sales")]
public sealed class CustomerAfterSalesController : BaseApiController
{
    /// <summary>
    /// Submit a return / warranty / refund request for a delivered order.
    /// Policy windows are validated automatically — tickets that violate policy
    /// are auto-rejected with a PolicyViolation message returned in the response.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> SubmitTicket(SubmitTicketDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new SubmitTicket.Command { Dto = dto }, ct));
    }

    /// <summary>
    /// List all after-sales tickets submitted by the current customer.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyTickets(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetMyTickets.Query { PageNumber = pageNumber, PageSize = pageSize }, ct));
    }

    /// <summary>
    /// Get full detail of a specific ticket belonging to the current customer.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMyTicketDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new GetMyTicketDetail.Query { Id = id }, ct));
    }
}

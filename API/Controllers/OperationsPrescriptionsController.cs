using Application.Prescriptions.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Operations")]
[Route("api/operations/prescriptions")]
public sealed class OperationsPrescriptionsController : BaseApiController
{
    // Lấy toàn bộ đơn kính trong hệ thống (không filter theo staff)
    // isVerified: null = tất cả, true = đã xác nhận, false = chưa xác nhận
    [HttpGet]
    public async Task<IActionResult> GetPrescriptions(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? isVerified = null,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetOperationsPrescriptions.Query
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                IsVerified = isVerified
            }, ct));
    }

    // Lấy chi tiết bất kỳ đơn kính nào trong hệ thống
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPrescriptionDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetOperationsPrescriptionDetail.Query { Id = id }, ct));
    }
}

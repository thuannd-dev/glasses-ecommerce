using Application.Prescriptions.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/me/prescriptions")]
public sealed class CustomerPrescriptionsController : BaseApiController
{
    // Lấy danh sách đơn kính của customer hiện tại (phân trang)
    [HttpGet]
    public async Task<IActionResult> GetMyPrescriptions(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetMyPrescriptions.Query
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            }, ct));
    }

    // Lấy chi tiết 1 đơn kính của customer (chỉ thấy đơn của mình)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMyPrescriptionDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetMyPrescriptionDetail.Query { Id = id }, ct));
    }
}

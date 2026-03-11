using Application.Prescriptions.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Sales")]
[Route("api/staff/prescriptions")]
public sealed class StaffPrescriptionsController : BaseApiController
{
    // Lấy danh sách đơn kính mà staff có quyền xem:
    //   - Orders mình tạo (offline lẫn online), HOẶC
    //   - Online orders có status Pending / Confirmed / Cancelled (chưa assign cho staff nào)
    // isVerified: null = tất cả, true = đã xác nhận, false = chưa xác nhận
    [HttpGet]
    public async Task<IActionResult> GetPrescriptions(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? isVerified = null,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetStaffPrescriptions.Query
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                IsVerified = isVerified
            }, ct));
    }

    // Lấy chi tiết 1 đơn kính — áp dụng cùng filter như danh sách (orders mình tạo hoặc online Pending/Confirmed/Cancelled)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPrescriptionDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetStaffPrescriptionDetail.Query { Id = id }, ct));
    }
}

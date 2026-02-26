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
    // Xem danh sách phiếu nhập kho — reuse query chung với Operations - manager thấy tất cả
    // Manager dùng để xem phiếu PendingApproval cần duyệt
    // Filter theo status (PendingApproval/Approved/Rejected)
    // Phân trang với pageNumber, pageSize
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

    // Xem chi tiết phiếu nhập kho (reuse query) — bao gồm items, thông tin người tạo/duyệt/từ chối
    [HttpGet("inbound/{id}")]
    public async Task<IActionResult> GetInboundDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetInboundDetail.Query { Id = id }, ct));
    }

    // Duyệt phiếu nhập kho → cập nhật stock thực tế
    // Flow: RepeatableRead transaction + UPDLOCK trên Stocks → tránh race condition
    // Cho mỗi item: Stock.QuantityOnHand += Quantity, tạo InventoryTransaction audit
    // Manager KHÔNG được approve record mình tạo (separation of duties — tránh gian lận)
    // ReferenceType tự động map từ SourceType (Supplier/Return/Adjustment)
    [HttpPut("inbound/{id}/approve")]
    public async Task<IActionResult> ApproveInbound(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new ApproveInbound.Command { InboundRecordId = id }, ct));
    }

    // Từ chối phiếu nhập kho — stock KHÔNG bị thay đổi
    // Input: RejectionReason (bắt buộc, tối đa 500 ký tự)
    // Cho phép tự reject record mình tạo (reject = hủy, không có risk gian lận)
    [HttpPut("inbound/{id}/reject")]
    public async Task<IActionResult> RejectInbound(Guid id, RejectInboundDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new RejectInbound.Command { InboundRecordId = id, Dto = dto }, ct));
    }
}

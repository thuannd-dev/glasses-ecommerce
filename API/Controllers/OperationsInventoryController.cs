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
    //**Record Outbound Transaction for Order (Audit Trail)**
    // Ghi nhận xuất kho cho đơn hàng — tạo InventoryTransaction cho mỗi OrderItem
    // Input: chỉ cần OrderId, số lượng lấy từ order items
    // Chỉ cho phép khi order status = Confirmed/Processing/Shipped
    // Chống duplicate: nếu đã ghi outbound cho order này rồi → trả lỗi 409
    // Transaction auto-approved (Status = Completed) vì đã link với order
    [HttpPost("outbound")]
    public async Task<IActionResult> RecordOutbound(RecordOutboundDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new RecordOutbound.Command { Dto = dto }, ct));
    }

    //**Get Inventory Transactions (Audit Trail)**
    // Xem lịch sử xuất/nhập kho — audit trail cho mọi biến động stock
    // Filter theo transactionType (Inbound/Outbound/Adjustment), referenceType, productVariantId
    // Phân trang với pageNumber, pageSize
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

    // Tạo phiếu nhập kho — status mặc định PendingApproval, chờ Manager duyệt
    // Input: SourceType (Supplier/Return/Adjustment), Items[] (ProductVariantId, Quantity)
    // Tự động merge duplicate ProductVariantId (cùng pattern CreateStaffOrder)
    // Validate: tất cả ProductVariantId phải tồn tại
    // Stock CHƯA được cập nhật — chỉ tạo record chờ duyệt
    [HttpPost("inbound")]
    public async Task<IActionResult> CreateInbound(CreateInboundDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new CreateInbound.Command { Dto = dto }, ct));
    }

    // Xem danh sách phiếu nhập kho
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

    // Xem chi tiết phiếu nhập kho — bao gồm danh sách items với VariantName, SKU, Quantity
    [HttpGet("inbound/{id}")]
    public async Task<IActionResult> GetInboundDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetInboundDetail.Query { Id = id }, ct));
    }
}

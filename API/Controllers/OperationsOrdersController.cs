using Application.Orders.Commands;
using Application.Orders.DTOs;
using Application.Orders.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Operations")]
[Route("api/operations/orders")]
public sealed class OperationsOrdersController : BaseApiController
{
    //**Get ALL Orders for Operations (no staff filter)**
    // Operations thấy TẤT CẢ đơn hàng (khác với Sales chỉ thấy đơn mình tạo)
    // Filter theo status, orderType, orderSource
    // Dùng để xem đơn cần xử lý: Confirmed → cần pick/pack, Processing → đang xử lý, Shipped → đã giao
    [HttpGet]
    public async Task<IActionResult> GetOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] OrderStatus? status = null,
        [FromQuery] OrderType? orderType = null,
        [FromQuery] OrderSource? orderSource = null,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetOperationsOrders.Query
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                Status = status,
                OrderType = orderType,
                OrderSource = orderSource
            }, ct));
    }

    //**Get Order Detail for Operations**
    // Xem chi tiết đơn hàng bất kỳ 
    // Response bao gồm: items, payment, prescription, shipment, statusHistories
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderDetail(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetOperationsOrderDetail.Query { Id = id }, ct));
    }

    //**Update Order Status for Operations**
    // Cập nhật trạng thái đơn hàng — reuse handler chung với Sales
    // Nếu Shipped → bắt buộc gửi kèm Shipment (carrierName, trackingCode, ...)
    // Nếu Cancelled → release stock (QuantityReserved -= quantity)
    // Nếu Completed → deduct stock (QuantityOnHand -= quantity, QuantityReserved -= quantity)
    // Ghi OrderStatusHistory (from → to, notes, changedBy)
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, UpdateOrderStatusDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new UpdateOrderStatus.Command { OrderId = id, Dto = dto }, ct));
    }
}

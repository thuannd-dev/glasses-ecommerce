using Application.Orders.Commands;
using Application.Orders.DTOs;
using Application.Orders.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Sales")]
[Route("api/staff/orders")]
public sealed class StaffOrdersController : BaseApiController
{
    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateStaffOrderDto dto, CancellationToken ct)
    {
        // Không cần cart — items truyền trực tiếp trong DTO
        // OrderSource có thể là Online hoặc Offline
        // Offline → không cần address, shippingFee = 0
        // Online → bắt buộc addressId
        // UserId (optional):
        //   - Có → on-behalf order, link customer account, validate address thuộc customer
        //   - Null → walk-in, dùng WalkInCustomerName + WalkInCustomerPhone
        // CreatedBySalesStaff = staffUserId
        // Payment Cash → PaymentStatus = Completed ngay
        return HandleResult(await Mediator.Send(new CreateStaffOrder.Command { Dto = dto }, ct));
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders(CancellationToken ct)
    {
        //Staff chỉ thấy đơn mình tạo (filter by CreatedBySalesStaff)
        return HandleResult(await Mediator.Send(new GetStaffOrders.Query(), ct));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderDetail(Guid id, CancellationToken ct)
    {
        //Staff chỉ thấy đơn mình tạo (filter by CreatedBySalesStaff)
        return HandleResult(await Mediator.Send(new GetStaffOrderDetail.Query { Id = id }, ct));
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, UpdateOrderStatusDto dto, CancellationToken ct)
    {
        // Nếu Cancelled → release stock (QuantityReserved -= quantity)
        // Nếu Completed → deduct stock (QuantityOnHand -= quantity, QuantityReserved -= quantity)
        // Ghi OrderStatusHistory (from → to, notes, changedBy)
        return HandleResult(await Mediator.Send(
            new UpdateOrderStatus.Command { OrderId = id, Dto = dto }, ct));
    }

    [HttpGet("reports/revenue")]
    public async Task<IActionResult> GetRevenueReport(
        [FromQuery] OrderSource? source,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken ct)
    {
        // tính doanh thu toàn hệ thống vì Report phục vụ quyết định kinh doanh, không phải cá nhân
        return HandleResult(await Mediator.Send(
            new GetRevenueReport.Query { Source = source, FromDate = fromDate, ToDate = toDate }, ct));
    }
}

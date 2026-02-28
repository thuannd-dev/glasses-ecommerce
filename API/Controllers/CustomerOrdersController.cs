using Application.Orders.Commands;
using Application.Orders.DTOs;
using Application.Orders.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/me/orders")]
public sealed class CustomerOrdersController : BaseApiController
{
    /// <summary>
    /// Checkout selected items from the active cart.
    /// </summary>
    /// <remarks>
    /// Supports **Partial Checkout**: 
    /// If only some items are selected, the original cart is converted to an Order, 
    /// and a new Active Cart is automatically generated containing the unselected items.
    /// 
    /// **Process:**
    /// - Order (status = Pending, source = Online)
    /// - OrderItem[] (from selected cart items)
    /// - Payment (status = Pending, method from dto)
    /// - PromoUsageLog (if promo is applied)
    /// - Prescription + PrescriptionDetail[] (if OrderType = Prescription)
    /// - OrderStatusHistory (Pending → Pending, "Order placed by customer")
    /// </remarks>
    [HttpPost]
    public async Task<IActionResult> Checkout(CheckoutDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new Checkout.Command { Dto = dto }, ct));
    }

    //get customer orders
    [HttpGet]
    public async Task<IActionResult> GetMyOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        //Customer chỉ thấy đơn của mình (filter by UserId)
        return HandleResult(await Mediator.Send(
            new GetMyOrders.Query
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            }, ct));
    }

    //get customer order detail
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMyOrderDetail(Guid id, CancellationToken ct)
    {
        //Customer chỉ thấy đơn của mình (filter by UserId)
        //Response bao gồm: items, payment, prescription, shipment, statusHistories
        return HandleResult(await Mediator.Send(new GetMyOrderDetail.Query { Id = id }, ct));
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id, CancelMyOrderDto dto, CancellationToken ct)
    {
        // Chỉ cancel được nếu order.CanBeCancelled(now) trả true
        // Domain logic check: status chưa Cancelled/Completed/Refunded
        return HandleResult(await Mediator.Send(
            new CancelMyOrder.Command { OrderId = id, Dto = dto }, ct));
    }
}

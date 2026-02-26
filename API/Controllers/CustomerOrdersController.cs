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
    //checkout from cart
    [HttpPost]
    public async Task<IActionResult> Checkout(CheckoutDto dto, CancellationToken ct)
    {
        // Order (status = Pending, source = Online)
        // OrderItem[] (từ cart items)
        // Payment (status = Pending, method từ dto)
        // PromoUsageLog (nếu có promo)
        // Prescription + PrescriptionDetail[] (nếu OrderType = Prescription)
        // OrderStatusHistory (Pending → Pending, "Order placed by customer")
        return HandleResult(await Mediator.Send(new Checkout.Command { Dto = dto }, ct));
    }

    //get customer orders
    [HttpGet]
    public async Task<IActionResult> GetMyOrders(CancellationToken ct)
    {
        //Customer chỉ thấy đơn của mình (filter by UserId)
        return HandleResult(await Mediator.Send(new GetMyOrders.Query(), ct));
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

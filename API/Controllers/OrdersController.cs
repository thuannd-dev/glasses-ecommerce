using Application.Orders.Commands;
using Application.Orders.DTOs;
using Application.Orders.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/orders")]
[Authorize(Roles = "OperationsStaff,Admin")]
public sealed class OrdersController : BaseApiController
{
    /// <summary>
    /// Get list of orders ready for picking/packing
    /// Requires: OperationsStaff or Admin role
    /// </summary>
    [HttpGet("picking/list")]
    public async Task<ActionResult<List<OrderPickingListItemDto>>> GetPickingOrders(
        [FromQuery] string? status = null,
        [FromQuery] string? searchTerm = null)
    {
        var orderStatus = status == null
            ? (OrderStatus?)null
            : Enum.Parse<OrderStatus>(status, ignoreCase: true);

        var query = new GetPickingOrders.Query
        {
            Status = orderStatus,
            SearchTerm = searchTerm
        };

        return HandleResult(await Mediator.Send(query));
    }

    /// <summary>
    /// Get specific order details for picking
    /// Requires: OperationsStaff or Admin role
    /// </summary>
    [HttpGet("picking/{orderId}")]
    public async Task<ActionResult<OrderPickingListItemDto>> GetOrderForPicking(Guid orderId)
    {
        return HandleResult(await Mediator.Send(new GetOrderForPicking.Query { OrderId = orderId }));
    }

    /// <summary>
    /// Get packing slip for an order
    /// Requires: OperationsStaff or Admin role
    /// </summary>
    [HttpGet("{orderId}/packing-slip")]
    public async Task<ActionResult<PackingSlipDto>> GetPackingSlip(Guid orderId)
    {
        return HandleResult(await Mediator.Send(new GetPackingSlip.Query { OrderId = orderId }));
    }

    /// <summary>
    /// Mark order as packed
    /// Requires: OperationsStaff or Admin role
    /// </summary>
    [HttpPut("{orderId}/mark-packed")]
    public async Task<ActionResult> MarkOrderAsPacked(
        Guid orderId,
        [FromBody] UpdateOrderStatusToPacked.Command command)
    {
        command.OrderId = orderId;
        return HandleResult(await Mediator.Send(command));
    }

    /// <summary>
    /// Create shipment and handover order to carrier
    /// Requires: OperationsStaff or Admin role
    /// </summary>
    [HttpPost("{orderId}/shipment")]
    public async Task<ActionResult<ShipmentHandoverDto>> CreateShipment(
        Guid orderId,
        [FromBody] CreateShipment.Command command)
    {
        command.OrderId = orderId;
        return HandleResult(await Mediator.Send(command));
    }
}

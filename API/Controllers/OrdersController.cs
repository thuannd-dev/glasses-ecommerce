using Application.Core;
using Application.Orders.Commands;
using Application.Orders.DTOs;
using Application.Orders.Queries;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/orders")]
[Authorize]
public sealed class OrdersController : BaseApiController
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<OrderListDto>>> GetOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? customerEmail = null,
        [FromQuery] OrderStatus? status = null,
        [FromQuery] OrderType? type = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        return HandleResult(await Mediator.Send(new GetOrderList.Query
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            CustomerEmail = customerEmail,
            Status = status,
            Type = type,
            FromDate = fromDate,
            ToDate = toDate
        }));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<OrderDetailDto>> GetOrderDetail(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetOrderDetail.Query { OrderId = id }));
    }

    [HttpPut("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateOrder(Guid id, [FromBody] UpdateOrderRequest request)
    {
        return HandleResult(await Mediator.Send(new UpdateOrderCommand.Command
        {
            OrderId = id,
            OrderItems = request.OrderItems?.Select(oi => new UpdateOrderCommand.UpdateOrderItem
            {
                OrderItemId = oi.OrderItemId,
                Quantity = oi.Quantity
            }).ToList(),
            Prescription = request.Prescription != null ? new UpdateOrderCommand.UpdatePrescription
            {
                Details = request.Prescription.Details.Select(d => new UpdateOrderCommand.UpdatePrescriptionDetail
                {
                    Eye = d.Eye,
                    SPH = d.SPH,
                    CYL = d.CYL,
                    AXIS = d.AXIS,
                    PD = d.PD,
                    ADD = d.ADD
                }).ToList()
            } : null
        }));
    }

    [HttpPut("{id}/confirm")]
    [AllowAnonymous]
    public async Task<IActionResult> ConfirmOrder(Guid id)
    {
        // Update order status to Confirmed
        return HandleResult(await Mediator.Send(new UpdateOrderStatusCommand.Command
        {
            OrderId = id,
            NewStatus = OrderStatus.Confirmed,
            PickedQuantity = null
        }));
    }

    [HttpGet("operation-queue")]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<OrderListDto>>> GetOperationQueueOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] OrderStatus filterStatus = OrderStatus.Confirmed,
        [FromQuery] string? customerEmail = null,
        [FromQuery] OrderType? type = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        return HandleResult(await Mediator.Send(new GetOperationQueueOrders.Query
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            FilterStatus = filterStatus,
            CustomerEmail = customerEmail,
            Type = type,
            FromDate = fromDate,
            ToDate = toDate
        }));
    }

    [HttpPost("{id}/select-lens")]
    [AllowAnonymous]
    public async Task<IActionResult> SelectLensForPrescription(
        Guid id,
        [FromBody] SelectLensRequest request)
    {
        return HandleResult(await Mediator.Send(new SelectLensForPrescriptionCommand.Command
        {
            OrderId = id,
            LensProductVariantId = request.LensProductVariantId,
            Quantity = request.Quantity
        }));
    }

    [HttpPut("{id}/status")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateOrderStatus(
        Guid id,
        [FromBody] UpdateOrderStatusRequest request)
    {
        return HandleResult(await Mediator.Send(new UpdateOrderStatusCommand.Command
        {
            OrderId = id,
            NewStatus = request.NewStatus,
            PickedQuantity = request.PickedQuantity
        }));
    }

    [HttpGet("in-production")]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<OrderListDto>>> GetInProductionOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? customerEmail = null,
        [FromQuery] OrderType? type = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        return HandleResult(await Mediator.Send(new GetInProductionOrders.Query
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            CustomerEmail = customerEmail,
            Type = type,
            FromDate = fromDate,
            ToDate = toDate
        }));
    }

    [HttpGet("completed")]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<OrderListDto>>> GetCompletedOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? customerEmail = null,
        [FromQuery] OrderType? type = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        return HandleResult(await Mediator.Send(new GetCompletedOrders.Query
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            CustomerEmail = customerEmail,
            Type = type,
            FromDate = fromDate,
            ToDate = toDate
        }));
    }
}

public sealed class UpdateOrderRequest
{
    public List<UpdateOrderItemRequest>? OrderItems { get; set; }
    public UpdatePrescriptionRequest? Prescription { get; set; }
}

public sealed class UpdateOrderItemRequest
{
    public required Guid OrderItemId { get; set; }
    public required int Quantity { get; set; }
}

public sealed class UpdatePrescriptionRequest
{
    public required List<UpdatePrescriptionDetailRequest> Details { get; set; }
}

public sealed class UpdatePrescriptionDetailRequest
{
    public EyeType Eye { get; set; }
    public decimal? SPH { get; set; }
    public decimal? CYL { get; set; }
    public int? AXIS { get; set; }
    public decimal? PD { get; set; }
    public decimal? ADD { get; set; }
}

public sealed class SelectLensRequest
{
    public required Guid LensProductVariantId { get; set; }
    public required int Quantity { get; set; }
}

public sealed class UpdateOrderStatusRequest
{
    public required OrderStatus NewStatus { get; set; }
    public int? PickedQuantity { get; set; }
}

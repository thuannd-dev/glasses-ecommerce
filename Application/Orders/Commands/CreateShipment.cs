using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Commands;

public sealed class CreateShipment
{
    public sealed class Command : IRequest<Result<ShipmentHandoverDto>>
    {
        public Guid OrderId { get; set; }
        
        public required string CarrierName { get; init; }
        
        public string? TrackingCode { get; init; }
        
        public string? TrackingUrl { get; init; }
        
        public decimal? PackageWeight { get; init; }
        
        public string? PackageDimensions { get; init; }
        
        public string? ShippingNotes { get; init; }
        
        public DateTime? EstimatedDeliveryAt { get; init; }
    }

    public sealed class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<ShipmentHandoverDto>>
    {
        public async Task<Result<ShipmentHandoverDto>> Handle(
            Command request,
            CancellationToken cancellationToken)
        {
            try
            {
                var order = await context.Orders
                    .Include(o => o.ShipmentInfo)
                    .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

                if (order == null)
                {
                    return Result<ShipmentHandoverDto>.Failure("Order not found", 404);
                }

                // Validate that order can be shipped
                if (order.OrderStatus != OrderStatus.Shipped && order.OrderStatus != OrderStatus.Processing && order.OrderStatus != OrderStatus.Confirmed)
                {
                    return Result<ShipmentHandoverDto>.Failure(
                        "Order must be in Processing, Confirmed, or Shipped status to handover to carrier", 400);
                }

                // Check if shipment already exists
                if (order.ShipmentInfo != null)
                {
                    return Result<ShipmentHandoverDto>.Failure("Shipment information already exists for this order", 400);
                }

                // Parse carrier name to enum
                if (!Enum.TryParse<ShippingCarrier>(request.CarrierName, true, out var carrier))
                {
                    return Result<ShipmentHandoverDto>.Failure(
                        $"Invalid carrier name. Supported carriers: {string.Join(", ", Enum.GetNames(typeof(ShippingCarrier)))}", 400);
                }

                // Get current user ID
                var userId = userAccessor.GetUserId();
                if (userId == Guid.Empty)
                {
                    return Result<ShipmentHandoverDto>.Failure("User information not available", 401);
                }

                // Create shipment
                var shipment = new ShipmentInfo
                {
                    OrderId = order.Id,
                    CarrierName = carrier,
                    TrackingCode = request.TrackingCode,
                    TrackingUrl = request.TrackingUrl,
                    PackageWeight = request.PackageWeight,
                    PackageDimensions = request.PackageDimensions,
                    ShippingNotes = request.ShippingNotes,
                    EstimatedDeliveryAt = request.EstimatedDeliveryAt,
                    ShippedAt = DateTime.UtcNow,
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                context.ShipmentInfos.Add(shipment);

                // Update order status
                var previousStatus = order.OrderStatus;
                order.OrderStatus = OrderStatus.Shipped;
                order.UpdatedAt = DateTime.UtcNow;

                // Record status change
                var statusHistory = new OrderStatusHistory
                {
                    OrderId = order.Id,
                    FromStatus = previousStatus,
                    ToStatus = OrderStatus.Shipped,
                    Notes = $"Order handed over to carrier {carrier}",
                    CreatedAt = DateTime.UtcNow
                };

                context.OrderStatusHistories.Add(statusHistory);
                await context.SaveChangesAsync(cancellationToken);

                var dto = new ShipmentHandoverDto
                {
                    OrderId = order.Id,
                    OrderNumber = order.Id.ToString().Substring(0, 8).ToUpper(),
                    CarrierName = shipment.CarrierName.ToString(),
                    TrackingCode = shipment.TrackingCode,
                    TrackingUrl = shipment.TrackingUrl,
                    PackageWeight = shipment.PackageWeight,
                    PackageDimensions = shipment.PackageDimensions,
                    ShippingNotes = shipment.ShippingNotes,
                    EstimatedDeliveryAt = shipment.EstimatedDeliveryAt
                };

                return Result<ShipmentHandoverDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return Result<ShipmentHandoverDto>.Failure(
                    $"Error creating shipment: {ex.Message}", 500);
            }
        }
    }
}

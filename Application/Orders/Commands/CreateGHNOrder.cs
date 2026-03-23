using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Commands;

public sealed class CreateGHNOrder
{
    public sealed class Command : IRequest<Result<string>>
    {
        public Guid OrderId { get; set; }
        public CreateGHNOrderDto Dto { get; set; } = new();
    }

    internal sealed class Handler(AppDbContext context, IGHNService ghnService, IUserAccessor userAccessor) : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            Order? order = await context.Orders
                .Include(o => o.Address)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductVariant)
                .ThenInclude(pv => pv.Product)
                .Include(o => o.ShipmentInfo)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

            if (order == null)
                return Result<string>.Failure("Order not found.", 404);

            if (order.Address == null)
                return Result<string>.Failure("Order must have a shipping address.", 400);

            if (order.OrderStatus != OrderStatus.Processing)
                return Result<string>.Failure("Only orders in Processing status can be pushed to GHN.", 400);

            if (order.ShipmentInfo != null && !string.IsNullOrEmpty(order.ShipmentInfo.TrackingCode))
                return Result<string>.Failure("Order already has a shipment and tracking code.", 400);

            if (order.OrderItems.Count == 0)
                return Result<string>.Failure("Cannot create a shipping order for an order with zero items.", 400);

            // Tự tính COD nếu chưa thu đủ
            decimal codAmount = 0;
            if (order.RemainingAmount > 0)
            {
                codAmount = order.RemainingAmount.Value;
            }

            // Map Order Items
            List<GHNItemDto> ghnItems = order.OrderItems.Select(oi => new GHNItemDto
            {
                Name = oi.ProductVariant.Product.ProductName,
                Code = oi.ProductVariant.SKU,
                Quantity = oi.Quantity,
                Price = oi.UnitPrice,
                Weight = request.Dto.Weight / order.OrderItems.Count // Chia đều trọng lượng giả định
            }).ToList();

            GHNCreateOrderRequestDto ghnRequest = new GHNCreateOrderRequestDto
            {
                ToName = order.Address.RecipientName,
                ToPhone = order.Address.RecipientPhone,
                ToAddress = order.Address.Venue,
                ToDistrictId = request.Dto.DistrictId,
                ToWardCode = request.Dto.WardCode,
                Weight = request.Dto.Weight,
                Length = request.Dto.Length,
                Width = request.Dto.Width,
                Height = request.Dto.Height,
                ServiceTypeId = 2,
                PaymentTypeId = 1,
                RequiredNote = request.Dto.RequiredNote,
                Items = ghnItems,
                ClientOrderCode = order.Id.ToString(),
                CodAmount = codAmount,
                InsuranceValue = order.TotalAmount
            };

            GHNCreateOrderResponseDto ghnResponse;
            try
            {
                ghnResponse = await ghnService.CreateShippingOrderAsync(ghnRequest);
            }
            catch (Exception ex)
            {
                return Result<string>.Failure(ex.Message, 400);
            }

            // Lưu TrackingCode vào ShipmentInfo
            if (order.ShipmentInfo == null)
            {
                ShipmentInfo newShipment = new ShipmentInfo
                {
                    OrderId = order.Id,
                    CarrierName = ShippingCarrier.GHN,
                    TrackingCode = ghnResponse.OrderCode,
                    CreatedBy = userAccessor.GetUserId(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                context.Set<ShipmentInfo>().Add(newShipment);
            }
            else
            {
                order.ShipmentInfo.TrackingCode = ghnResponse.OrderCode;
                order.ShipmentInfo.CarrierName = ShippingCarrier.GHN;
                order.ShipmentInfo.UpdatedAt = DateTime.UtcNow;
            }

            // (Optional) Update order status here? - Current status is Processing
            // Usually we leave order status update to explicit actions or webhook

            bool success = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!success)
                return Result<string>.Failure("Failed to save tracking code.", 500);

            return Result<string>.Success(ghnResponse.OrderCode);
        }
    }
}

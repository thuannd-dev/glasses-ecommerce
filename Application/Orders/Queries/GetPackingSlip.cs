using Application.Core;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetPackingSlip
{
    public sealed class Query : IRequest<Result<PackingSlipDto>>
    {
        public required Guid OrderId { get; init; }
    }

    public sealed class Handler(AppDbContext context) : IRequestHandler<Query, Result<PackingSlipDto>>
    {
        public async Task<Result<PackingSlipDto>> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            try
            {
                var order = await context.Orders
                    .Include(o => o.Address)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                            .ThenInclude(pv => pv.Product)
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

                if (order == null)
                {
                    return Result<PackingSlipDto>.Failure("Order not found", 404);
                }

                // Only allow packing slip for orders that are being processed/packed
                if (order.OrderStatus != OrderStatus.Processing && order.OrderStatus != OrderStatus.Confirmed)
                {
                    return Result<PackingSlipDto>.Failure(
                        "Order must be in Processing or Confirmed status to generate packing slip", 400);
                }

                var dto = MapToDto(order);
                return Result<PackingSlipDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return Result<PackingSlipDto>.Failure(
                    $"Error retrieving packing slip: {ex.Message}", 500);
            }
        }

        private PackingSlipDto MapToDto(Order order)
        {
            var customerInfo = new CustomerInfoDto
            {
                Name = order.User?.DisplayName ?? order.Address.RecipientName,
                Email = order.User?.Email ?? "N/A",
                PhoneNumber = order.Address.RecipientPhone
            };

            var shippingAddress = new ShippingAddressDto
            {
                RecipientName = order.Address.RecipientName,
                RecipientPhone = order.Address.RecipientPhone,
                Venue = order.Address.Venue,
                Ward = order.Address.Ward,
                District = order.Address.District,
                City = order.Address.City,
                PostalCode = order.Address.PostalCode
            };

            var items = order.OrderItems.Select(oi => new PackingSlipItemDto
            {
                ProductName = oi.ProductVariant.Product.ProductName,
                VariantName = oi.ProductVariant.VariantName ?? $"SKU: {oi.ProductVariant.SKU}",
                PickedQuantity = oi.Quantity,
                IsChecked = false
            }).ToArray();

            return new PackingSlipDto
            {
                OrderId = order.Id,
                OrderNumber = order.Id.ToString().Substring(0, 8).ToUpper(),
                OrderDate = order.CreatedAt,
                TotalAmount = order.TotalAmount + order.ShippingFee,
                CustomerInfo = customerInfo,
                ShippingAddress = shippingAddress,
                Items = items,
                CustomerNote = order.CustomerNote,
                PrintedAt = DateTime.UtcNow
            };
        }
    }
}

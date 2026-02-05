using Application.Core;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetOrderForPicking
{
    public sealed class Query : IRequest<Result<OrderPickingListItemDto>>
    {
        public required Guid OrderId { get; init; }
    }

    public sealed class Handler(AppDbContext context) : IRequestHandler<Query, Result<OrderPickingListItemDto>>
    {
        public async Task<Result<OrderPickingListItemDto>> Handle(
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
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                            .ThenInclude(pv => pv.Stock)
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

                if (order == null)
                {
                    return Result<OrderPickingListItemDto>.Failure("Order not found", 404);
                }

                var dto = MapToDto(order);
                return Result<OrderPickingListItemDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return Result<OrderPickingListItemDto>.Failure(
                    $"Error retrieving order: {ex.Message}", 500);
            }
        }

        private OrderPickingListItemDto MapToDto(Order order)
        {
            var items = order.OrderItems.Select(oi => new OrderItemPickDto
            {
                OrderItemId = oi.Id,
                ProductVariantId = oi.ProductVariant.Id,
                ProductName = oi.ProductVariant.Product.ProductName,
                VariantName = oi.ProductVariant.VariantName ?? $"SKU: {oi.ProductVariant.SKU}",
                RequiredQuantity = oi.Quantity,
                AvailableStock = oi.ProductVariant.Stock?.QuantityAvailable ?? 0,
                PickedQuantity = 0
            }).ToArray();

            return new OrderPickingListItemDto
            {
                OrderId = order.Id,
                OrderNumber = order.Id.ToString().Substring(0, 8).ToUpper(),
                OrderDate = order.CreatedAt,
                CustomerName = order.Address.RecipientName,
                TotalAmount = order.TotalAmount,
                TotalItems = order.OrderItems.Sum(oi => oi.Quantity),
                Items = items
            };
        }
    }
}

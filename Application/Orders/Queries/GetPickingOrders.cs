using Application.Core;
using Application.Orders.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetPickingOrders
{
    public sealed class Query : IRequest<Result<List<OrderPickingListItemDto>>>
    {
        /// <summary>
        /// Filter by order status (e.g., Confirmed, Processing)
        /// </summary>
        public OrderStatus? Status { get; set; }
        
        /// <summary>
        /// Search by order ID or customer name
        /// </summary>
        public string? SearchTerm { get; set; }
    }

    public sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<List<OrderPickingListItemDto>>>
    {
        public async Task<Result<List<OrderPickingListItemDto>>> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            try
            {
                var query = context.Orders
                    .Include(o => o.Address)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                            .ThenInclude(pv => pv.Product)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                            .ThenInclude(pv => pv.Stock)
                    .Include(o => o.User)
                    .AsQueryable();

                // Filter by status - typically orders in Processing or Confirmed status
                if (request.Status.HasValue)
                {
                    query = query.Where(o => o.OrderStatus == request.Status.Value);
                }
                else
                {
                    // Default: get orders that are Confirmed or Processing
                    query = query.Where(o => o.OrderStatus == OrderStatus.Confirmed || o.OrderStatus == OrderStatus.Processing);
                }

                // Don't include orders that are already shipped
                query = query.Where(o => o.ShipmentInfo == null);

                // Search filter
                if (!string.IsNullOrWhiteSpace(request.SearchTerm))
                {
                    var searchLower = request.SearchTerm.ToLower();
                    query = query.Where(o =>
                        o.Id.ToString().Contains(searchLower) ||
                        o.Address.RecipientName.ToLower().Contains(searchLower));
                }

                var orders = await query
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync(cancellationToken);

                var result = orders.Select(MapToDto).ToList();

                return Result<List<OrderPickingListItemDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<List<OrderPickingListItemDto>>.Failure(
                    $"Error retrieving picking orders: {ex.Message}", 500);
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

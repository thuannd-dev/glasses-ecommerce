using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Commands;

public sealed class SelectLensForPrescriptionCommand
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid OrderId { get; set; }
        public required Guid LensProductVariantId { get; set; }
        public required int Quantity { get; set; }
    }

    public sealed class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var order = await context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

            if (order == null)
                return Result<Unit>.Failure("Order not found", 404);

            if (order.OrderType != OrderType.Prescription)
                return Result<Unit>.Failure("Order is not a prescription order", 400);

            // Check if lens product variant exists
            var lensVariant = await context.Set<ProductVariant>()
                .FirstOrDefaultAsync(pv => pv.Id == request.LensProductVariantId, cancellationToken);

            if (lensVariant == null)
                return Result<Unit>.Failure("Lens product variant not found", 404);

            // Check inventory
            var stock = await context.Set<Stock>()
                .FirstOrDefaultAsync(s => s.ProductVariantId == request.LensProductVariantId, cancellationToken);

            if (stock == null || stock.QuantityAvailable < request.Quantity)
                return Result<Unit>.Failure("Insufficient inventory for selected lens", 400);

            // Update inventory - increase reserved, keep on-hand the same
            stock.QuantityReserved += request.Quantity;
            stock.UpdatedAt = DateTime.UtcNow;

            // Create or update order item for the lens
            var lensOrderItem = order.OrderItems.FirstOrDefault(oi => oi.ProductVariantId == request.LensProductVariantId);

            if (lensOrderItem != null)
            {
                // Update existing lens item quantity
                var quantityDifference = request.Quantity - lensOrderItem.Quantity;
                if (quantityDifference != 0)
                {
                    stock.QuantityReserved += quantityDifference;
                }
                lensOrderItem.Quantity = request.Quantity;
            }
            else
            {
                // Add new lens order item
                var newOrderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductVariantId = request.LensProductVariantId,
                    Quantity = request.Quantity,
                    UnitPrice = lensVariant.Price
                };
                context.OrderItems.Add(newOrderItem);
            }

            // Update order status to InProduction
            order.OrderStatus = OrderStatus.InProduction;
            order.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync(cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

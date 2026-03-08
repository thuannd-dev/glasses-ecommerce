using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class DeleteVariant
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid ProductId { get; set; }
        public required Guid VariantId { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            ProductVariant? variant = await context.ProductVariants
                .FirstOrDefaultAsync(v => v.Id == request.VariantId, ct);

            if (variant == null)
                return Result<Unit>.Failure("Variant not found.", 404);

            // Ownership check: variant must belong to the product in the route
            if (variant.ProductId != request.ProductId)
                return Result<Unit>.Failure("Variant not found.", 404);

            if (!variant.IsActive)
                return Result<Unit>.Success(Unit.Value); // idempotent

            bool hasActiveOrders = await context.OrderItems
                .AnyAsync(oi =>
                    oi.ProductVariantId == request.VariantId &&
                    oi.Order.OrderStatus != OrderStatus.Delivered &&
                    oi.Order.OrderStatus != OrderStatus.Completed &&
                    oi.Order.OrderStatus != OrderStatus.Cancelled &&
                    oi.Order.OrderStatus != OrderStatus.Refunded, ct);

            if (hasActiveOrders)
                return Result<Unit>.Failure(
                    "Cannot deactivate variant: it has active orders.", 409);

            variant.IsActive = false;

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Unit>.Failure("Failed to deactivate variant.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

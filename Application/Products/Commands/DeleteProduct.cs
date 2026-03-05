using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class DeleteProduct
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid ProductId { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            Product? product = await context.Products
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == request.ProductId, ct);

            if (product == null)
                return Result<Unit>.Failure("Product not found.", 404);

            if (product.Status == ProductStatus.Inactive)
                return Result<Unit>.Success(Unit.Value); // idempotent

            // Kiểm tra còn variant đang gắn với order active không
            List<Guid> variantIds = product.Variants
                .Select(v => v.Id)
                .ToList();

            if (variantIds.Count > 0)
            {
                bool hasActiveOrders = await context.OrderItems
                    .AnyAsync(oi =>
                        variantIds.Contains(oi.ProductVariantId) &&
                        oi.Order.OrderStatus != OrderStatus.Delivered &&
                        oi.Order.OrderStatus != OrderStatus.Completed &&
                        oi.Order.OrderStatus != OrderStatus.Cancelled &&
                        oi.Order.OrderStatus != OrderStatus.Refunded, ct);

                if (hasActiveOrders)
                    return Result<Unit>.Failure(
                        "Cannot deactivate product: one or more variants have active orders.", 409);
            }

            // Soft delete: inactive product + deactivate all variants
            product.Status = ProductStatus.Inactive;

            foreach (ProductVariant variant in product.Variants)
            {
                variant.IsActive = false;
            }

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Unit>.Failure("Failed to deactivate product.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

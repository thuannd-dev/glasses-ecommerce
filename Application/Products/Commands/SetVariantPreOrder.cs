using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class SetVariantPreOrder
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid ProductId { get; set; }
        public required Guid VariantId { get; set; }
        public required bool IsPreOrder { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            ProductVariant? variant = await context.ProductVariants
                .FirstOrDefaultAsync(pv => pv.Id == request.VariantId, ct);

            if (variant == null)
                return Result<Unit>.Failure("Product variant not found.", 404);

            // Ownership check: variant must belong to the product in the route
            if (variant.ProductId != request.ProductId)
                return Result<Unit>.Failure("Product variant not found.", 404);

            if (variant.IsPreOrder == request.IsPreOrder)
                return Result<Unit>.Success(Unit.Value); // idempotent — không cần save nếu không đổi

            variant.IsPreOrder = request.IsPreOrder;

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Unit>.Failure("Failed to update variant pre-order status.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

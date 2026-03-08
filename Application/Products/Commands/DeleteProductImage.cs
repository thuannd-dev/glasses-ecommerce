using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class DeleteProductImage
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid ProductId { get; set; }
        public required Guid ImageId { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            ProductImage? image = await context.ProductImages
                .Include(i => i.ProductVariant)
                .FirstOrDefaultAsync(i => i.Id == request.ImageId, ct);

            if (image == null || image.IsDeleted)
                return Result<Unit>.Failure("Image not found.", 404);

            // Ownership check: image must belong to the product in the route
            // Image can be product-level (ProductId) or variant-level (via ProductVariant.ProductId)
            bool belongsToProduct =
                image.ProductId == request.ProductId ||
                (image.ProductVariant != null && image.ProductVariant.ProductId == request.ProductId);

            if (!belongsToProduct)
                return Result<Unit>.Failure("Image not found.", 404);

            Guid currentUserId = userAccessor.GetUserId();

            image.IsDeleted = true;
            image.DeletedAt = DateTime.UtcNow;
            image.DeletedBy = currentUserId;

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Unit>.Failure("Failed to delete image.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

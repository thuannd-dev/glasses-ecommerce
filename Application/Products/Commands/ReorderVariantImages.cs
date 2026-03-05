using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class ReorderVariantImages
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid ProductId { get; set; }
        public required Guid VariantId { get; set; }
        public required ReorderImagesDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            ReorderImagesDto dto = request.Dto;

            ProductVariant? variant = await context.ProductVariants
                .FirstOrDefaultAsync(v => v.Id == request.VariantId, ct);

            if (variant == null)
                return Result<Unit>.Failure("Variant not found.", 404);

            // Ownership check
            if (variant.ProductId != request.ProductId)
                return Result<Unit>.Failure("Variant not found.", 404);

            // Load all non-deleted variant-level images for this specific variant
            List<ProductImage> images = await context.ProductImages
                .Where(i =>
                    !i.IsDeleted &&
                    i.ProductVariantId == request.VariantId)
                .ToListAsync(ct);

            // Validate: the submitted list must contain exactly the same IDs as existing images
            HashSet<Guid> existingIds = images.Select(i => i.Id).ToHashSet();
            HashSet<Guid> submittedIds = dto.ImageIds.ToHashSet();

            if (submittedIds.Count != dto.ImageIds.Count)
                return Result<Unit>.Failure("Duplicate image IDs in the request.", 400);

            if (!existingIds.SetEquals(submittedIds))
                return Result<Unit>.Failure(
                    "Image IDs do not match the variant's images. Ensure all image IDs are included.", 400);

            Dictionary<Guid, ProductImage> imageById = images.ToDictionary(i => i.Id);

            for (int i = 0; i < dto.ImageIds.Count; i++)
            {
                imageById[dto.ImageIds[i]].DisplayOrder = i;
            }

            if (!context.ChangeTracker.HasChanges())
                return Result<Unit>.Success(Unit.Value);

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Unit>.Failure("Failed to reorder variant images.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

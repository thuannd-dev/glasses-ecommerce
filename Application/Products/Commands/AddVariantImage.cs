using Application.Core;
using Application.Interfaces;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class AddVariantImage
{
    public sealed class Command : IRequest<Result<Guid>>
    {
        public required Guid ProductId { get; set; }
        public required Guid VariantId { get; set; }
        public required AddVariantImageDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Guid>>
    {
        public async Task<Result<Guid>> Handle(Command request, CancellationToken ct)
        {
            AddVariantImageDto dto = request.Dto;

            // Validate variant belongs to the product in route
            bool variantBelongsToProduct = await context.ProductVariants
                .AnyAsync(v =>
                    v.Id == request.VariantId &&
                    v.ProductId == request.ProductId, ct);

            if (!variantBelongsToProduct)
                return Result<Guid>.Failure("Variant not found or does not belong to this product.", 404);

            Guid currentUserId = userAccessor.GetUserId();

            ProductImage image = new()
            {
                ProductId = null,
                ProductVariantId = request.VariantId,
                ImageUrl = dto.ImageUrl,
                AltText = string.IsNullOrWhiteSpace(dto.AltText) ? null : dto.AltText,
                DisplayOrder = dto.DisplayOrder,
                ModelUrl = string.IsNullOrWhiteSpace(dto.ModelUrl) ? null : dto.ModelUrl,
                CreatedBy = currentUserId
            };

            context.ProductImages.Add(image);

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Guid>.Failure("Failed to add variant image.", 500);

            return Result<Guid>.Success(image.Id);
        }
    }
}

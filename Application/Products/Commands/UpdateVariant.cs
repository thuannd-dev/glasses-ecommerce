using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class UpdateVariant
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid ProductId { get; set; }
        public required Guid VariantId { get; set; }
        public required UpdateVariantDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            UpdateVariantDto dto = request.Dto;

            ProductVariant? variant = await context.ProductVariants
                .FirstOrDefaultAsync(v => v.Id == request.VariantId, ct);

            if (variant == null)
                return Result<Unit>.Failure("Variant not found.", 404);

            // Ownership check: variant must belong to the product in the route
            if (variant.ProductId != request.ProductId)
                return Result<Unit>.Failure("Variant not found.", 404);

            // SKU uniqueness check if changing SKU
            if (!string.IsNullOrWhiteSpace(dto.SKU) && dto.SKU != variant.SKU)
            {
                bool skuExists = await context.ProductVariants
                    .AnyAsync(v => v.SKU == dto.SKU && v.Id != request.VariantId, ct);

                if (skuExists)
                    return Result<Unit>.Failure($"SKU '{dto.SKU}' already exists.", 409);

                variant.SKU = dto.SKU;
            }

            if (dto.VariantName != null)
                variant.VariantName = string.IsNullOrWhiteSpace(dto.VariantName) ? null : dto.VariantName;

            if (dto.Color != null)
                variant.Color = string.IsNullOrWhiteSpace(dto.Color) ? null : dto.Color;

            if (dto.Size != null)
                variant.Size = string.IsNullOrWhiteSpace(dto.Size) ? null : dto.Size;

            if (dto.Material != null)
                variant.Material = string.IsNullOrWhiteSpace(dto.Material) ? null : dto.Material;

            if (dto.FrameWidth.HasValue)
                variant.FrameWidth = dto.FrameWidth;

            if (dto.LensWidth.HasValue)
                variant.LensWidth = dto.LensWidth;

            if (dto.BridgeWidth.HasValue)
                variant.BridgeWidth = dto.BridgeWidth;

            if (dto.TempleLength.HasValue)
                variant.TempleLength = dto.TempleLength;

            // Guard: resolve effective final Price and final CompareAtPrice
            // Validate cross-field constraint regardless of which one was submitted natively.
            decimal finalPrice = dto.Price ?? variant.Price;
            decimal? finalCompareAtPrice = dto.CompareAtPrice ?? variant.CompareAtPrice;

            if (finalCompareAtPrice.HasValue && finalCompareAtPrice.Value < finalPrice)
                return Result<Unit>.Failure(
                    "Compare-at price must be greater than or equal to the selling price.", 400);

            if (dto.Price.HasValue)
                variant.Price = dto.Price.Value;

            if (dto.CompareAtPrice.HasValue)
                variant.CompareAtPrice = dto.CompareAtPrice;

            if (dto.IsActive.HasValue)
                variant.IsActive = dto.IsActive.Value;

            try
            {
                int affectedRows = await context.SaveChangesAsync(ct);

                if (affectedRows == 0 && context.Entry(variant).State == EntityState.Unchanged)
                    return Result<Unit>.Success(Unit.Value);

                if (affectedRows == 0)
                    return Result<Unit>.Failure("Failed to update variant.", 500);

                return Result<Unit>.Success(Unit.Value);
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("IX_ProductVariant_SKU", StringComparison.OrdinalIgnoreCase) == true)
            {
                return Result<Unit>.Failure($"SKU '{dto.SKU}' already exists.", 409);
            }
        }
    }
}

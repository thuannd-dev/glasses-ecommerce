using System.Data;
using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Persistence;

namespace Application.Products.Commands;

public sealed class AddVariant
{
    public sealed class Command : IRequest<Result<Guid>>
    {
        public required Guid ProductId { get; set; }
        public required CreateVariantDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Command, Result<Guid>>
    {
        public async Task<Result<Guid>> Handle(Command request, CancellationToken ct)
        {
            CreateVariantDto dto = request.Dto;

            // SqlServerRetryingExecutionStrategy does not support user-initiated transactions.
            // Wrap so the strategy can retry the entire unit of work.
            return await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                context.ChangeTracker.Clear();

                await using IDbContextTransaction transaction =
                    await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, ct);

                Product? product = await context.Products
                    .FirstOrDefaultAsync(p => p.Id == request.ProductId, ct);

                if (product == null)
                    return Result<Guid>.Failure("Product not found.", 404);

                if (product.Status == ProductStatus.Inactive)
                    return Result<Guid>.Failure("Cannot add variant to an inactive product.", 400);

                bool skuExists = await context.ProductVariants
                    .AnyAsync(v => v.SKU == dto.SKU, ct);

                if (skuExists)
                    return Result<Guid>.Failure($"SKU '{dto.SKU}' already exists.", 409);

                ProductVariant variant = new()
                {
                    ProductId = request.ProductId,
                    SKU = dto.SKU,
                    VariantName = string.IsNullOrWhiteSpace(dto.VariantName) ? null : dto.VariantName,
                    Color = string.IsNullOrWhiteSpace(dto.Color) ? null : dto.Color,
                    Size = string.IsNullOrWhiteSpace(dto.Size) ? null : dto.Size,
                    Material = string.IsNullOrWhiteSpace(dto.Material) ? null : dto.Material,
                    FrameWidth = dto.FrameWidth,
                    LensWidth = dto.LensWidth,
                    BridgeWidth = dto.BridgeWidth,
                    TempleLength = dto.TempleLength,
                    Price = dto.Price,
                    CompareAtPrice = dto.CompareAtPrice,
                    IsActive = true,
                    IsPreOrder = dto.IsPreOrder
                };

                context.ProductVariants.Add(variant);

                // Domain invariant: every ProductVariant MUST have a corresponding Stock row.
                // Without this, all inventory-related queries will throw NullReferenceException.
                Stock stock = new()
                {
                    ProductVariantId = variant.Id,
                    QuantityOnHand = 0,
                    QuantityReserved = 0
                };

                context.Stocks.Add(stock);

                try
                {
                    int affectedRows = await context.SaveChangesAsync(ct);

                    if (affectedRows == 0)
                        return Result<Guid>.Failure("Failed to add variant.", 500);
                }
                catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("IX_ProductVariant_SKU", StringComparison.OrdinalIgnoreCase) == true)
                {
                    // Handle concurrent SKU collision (UNIQUE constraint violation)
                    return Result<Guid>.Failure($"SKU '{dto.SKU}' already exists.", 409);
                }

                await transaction.CommitAsync(ct);

                return Result<Guid>.Success(variant.Id);
            });
        }
    }
}

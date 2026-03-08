using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class UpdateProduct
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid ProductId { get; set; }
        public required UpdateProductDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            UpdateProductDto dto = request.Dto;

            Product? product = await context.Products
                .FirstOrDefaultAsync(p => p.Id == request.ProductId, ct);

            if (product == null)
                return Result<Unit>.Failure("Product not found.", 404);

            if (dto.CategoryId.HasValue)
            {
                bool categoryExists = await context.ProductCategories
                    .AnyAsync(c => c.Id == dto.CategoryId.Value && c.IsActive, ct);

                if (!categoryExists)
                    return Result<Unit>.Failure("Category not found or inactive.", 404);

                product.CategoryId = dto.CategoryId.Value;
            }

            if (!string.IsNullOrWhiteSpace(dto.ProductName))
                product.ProductName = dto.ProductName;

            if (dto.Description != null)
                product.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description;

            if (dto.Brand != null)
                product.Brand = string.IsNullOrWhiteSpace(dto.Brand) ? null : dto.Brand;

            if (dto.Status.HasValue)
                product.Status = dto.Status.Value;

            bool success = await context.SaveChangesAsync(ct) > 0;

            // success = false is acceptable when no fields actually changed
            if (!success && context.Entry(product).State == EntityState.Unchanged)
                return Result<Unit>.Success(Unit.Value);

            if (!success)
                return Result<Unit>.Failure("Failed to update product.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

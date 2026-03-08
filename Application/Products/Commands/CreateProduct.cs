using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class CreateProduct
{
    public sealed class Command : IRequest<Result<Guid>>
    {
        public required CreateProductDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Command, Result<Guid>>
    {
        public async Task<Result<Guid>> Handle(Command request, CancellationToken ct)
        {
            CreateProductDto dto = request.Dto;

            bool categoryExists = await context.ProductCategories
                .AnyAsync(c => c.Id == dto.CategoryId && c.IsActive, ct);

            if (!categoryExists)
                return Result<Guid>.Failure("Category not found or inactive.", 404);

            Product product = new()
            {
                CategoryId = dto.CategoryId,
                ProductName = dto.ProductName,
                Type = dto.Type,
                Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description,
                Brand = string.IsNullOrWhiteSpace(dto.Brand) ? null : dto.Brand,
                Status = dto.Status
            };

            context.Products.Add(product);

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Guid>.Failure("Failed to create product.", 500);

            return Result<Guid>.Success(product.Id);
        }
    }
}

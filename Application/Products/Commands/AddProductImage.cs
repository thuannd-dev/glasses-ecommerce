using Application.Core;
using Application.Interfaces;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class AddProductImage
{
    public sealed class Command : IRequest<Result<Guid>>
    {
        public required Guid ProductId { get; set; }
        public required AddProductImageDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Guid>>
    {
        public async Task<Result<Guid>> Handle(Command request, CancellationToken ct)
        {
            AddProductImageDto dto = request.Dto;

            bool productExists = await context.Products
                .AnyAsync(p => p.Id == request.ProductId, ct);

            if (!productExists)
                return Result<Guid>.Failure("Product not found.", 404);

            Guid currentUserId = userAccessor.GetUserId();

            ProductImage image = new()
            {
                ProductId = request.ProductId,
                ProductVariantId = null,
                ImageUrl = dto.ImageUrl,
                AltText = string.IsNullOrWhiteSpace(dto.AltText) ? null : dto.AltText,
                DisplayOrder = dto.DisplayOrder,
                ModelUrl = string.IsNullOrWhiteSpace(dto.ModelUrl) ? null : dto.ModelUrl,
                CreatedBy = currentUserId
            };

            context.ProductImages.Add(image);

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Guid>.Failure("Failed to add image.", 500);

            return Result<Guid>.Success(image.Id);
        }
    }
}

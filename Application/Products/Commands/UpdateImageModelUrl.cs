using Application.Core;
using Application.Interfaces;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class UpdateImageModelUrl
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid ProductId { get; set; }
        public required Guid ImageId { get; set; }
        public required UpdateImageModelUrlDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            ProductImage? image = await context.ProductImages
                .FirstOrDefaultAsync(i => i.Id == request.ImageId &&
                                         (i.ProductId == request.ProductId || i.ProductVariant!.ProductId == request.ProductId), ct);

            if (image == null)
                return Result<Unit>.Failure("Image not found or does not belong to this product.", 404);

            image.ModelUrl = string.IsNullOrWhiteSpace(request.Dto.ModelUrl) ? null : request.Dto.ModelUrl;

            if (!context.ChangeTracker.HasChanges())
                return Result<Unit>.Success(Unit.Value);

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Unit>.Failure("Failed to update image model URL.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

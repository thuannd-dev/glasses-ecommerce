using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class AddFrameLensCompatibility
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid FrameProductId { get; set; }
        public required Guid LensProductId { get; set; }
    }

    internal sealed class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            // Validate frame product
            Product? frameProduct = await context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == request.FrameProductId, ct);

            if (frameProduct == null)
                return Result<Unit>.Failure("Frame product not found.", 404);

            if (frameProduct.Type != ProductType.Frame)
                return Result<Unit>.Failure("First product must be of type Frame.", 400);

            // Validate lens product
            Product? lensProduct = await context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == request.LensProductId, ct);

            if (lensProduct == null)
                return Result<Unit>.Failure("Lens product not found.", 404);

            if (lensProduct.Type != ProductType.Lens)
                return Result<Unit>.Failure("Second product must be of type Lens.", 400);

            // Check duplicate
            bool alreadyLinked = await context.FrameLensCompatibilities
                .AnyAsync(flc => flc.FrameProductId == request.FrameProductId
                               && flc.LensProductId == request.LensProductId, ct);

            if (alreadyLinked)
                return Result<Unit>.Failure("This lens is already linked to the frame.", 409);

            context.FrameLensCompatibilities.Add(new FrameLensCompatibility
            {
                FrameProductId = request.FrameProductId,
                LensProductId  = request.LensProductId,
            });

            bool success = await context.SaveChangesAsync(ct) > 0;
            if (!success)
                return Result<Unit>.Failure("Failed to link lens to frame.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

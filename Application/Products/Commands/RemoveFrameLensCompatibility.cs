using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class RemoveFrameLensCompatibility
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
            FrameLensCompatibility? link = await context.FrameLensCompatibilities
                .FirstOrDefaultAsync(flc => flc.FrameProductId == request.FrameProductId
                                          && flc.LensProductId == request.LensProductId, ct);

            if (link == null)
                return Result<Unit>.Failure("Compatibility link not found.", 404);

            context.FrameLensCompatibilities.Remove(link);

            bool success = await context.SaveChangesAsync(ct) > 0;
            if (!success)
                return Result<Unit>.Failure("Failed to remove compatibility link.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

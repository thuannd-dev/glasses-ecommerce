using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class DeleteLensCoatingOption
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid CoatingId { get; set; }
    }

    internal sealed class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            LensCoatingOption? coating = await context.LensCoatingOptions
                .FirstOrDefaultAsync(c => c.Id == request.CoatingId, ct);

            if (coating == null)
                return Result<Unit>.Failure("Coating option not found.", 404);

            context.LensCoatingOptions.Remove(coating);

            bool success = await context.SaveChangesAsync(ct) > 0;
            if (!success)
                return Result<Unit>.Failure("Failed to delete coating option.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

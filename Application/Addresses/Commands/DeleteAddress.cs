using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Addresses.Commands;

public sealed class DeleteAddress
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid AddressId { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            // Find address and verify ownership
            Address? address = await context.Addresses
                .FirstOrDefaultAsync(a => a.Id == request.AddressId
                    && a.UserId == userId
                    && !a.IsDeleted, cancellationToken);

            if (address == null)
            {
                return Result<Unit>.Failure("Address not found.", 404);
            }

            // Perform soft delete
            address.IsDeleted = true;
            address.DeletedAt = DateTime.UtcNow;
            address.IsDefault = false;

            bool success = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!success)
            {
                return Result<Unit>.Failure("Failed to delete address.", 500);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

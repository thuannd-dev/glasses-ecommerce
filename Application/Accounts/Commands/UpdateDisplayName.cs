using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Persistence;

namespace Application.Accounts.Commands;

public sealed class UpdateDisplayName
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required string DisplayName { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            // Validate display name
            if (string.IsNullOrWhiteSpace(request.DisplayName))
                return Result<Unit>.Failure("Display name cannot be empty.", 400);

            if (request.DisplayName.Length > 100)
                return Result<Unit>.Failure("Display name cannot exceed 100 characters.", 400);

            // Get current user
            Guid userId = userAccessor.GetUserId();
            User? user = await context.Users.FindAsync(new object[] { userId }, cancellationToken: ct);

            if (user == null)
                return Result<Unit>.Failure("User not found.", 404);

            // Update display name
            user.DisplayName = request.DisplayName.Trim();

            context.Users.Update(user);
            bool saved = await context.SaveChangesAsync(ct) > 0;

            if (!saved)
                return Result<Unit>.Failure("Failed to update display name.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Policies.Commands;

public sealed class DeletePolicy
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            PolicyConfiguration? policy = await context.PolicyConfigurations
                .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

            if (policy == null) return Result<Unit>.Failure("Policy not found", 404);
            if (policy.IsDeleted) return Result<Unit>.Failure("Policy is already deleted.", 400);

            policy.IsDeleted = true;
            policy.IsActive = false; // Automatically deactivate on delete
            policy.DeletedAt = DateTime.UtcNow;
            policy.DeletedBy = userAccessor.GetUserId();

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success) return Result<Unit>.Failure("Failed to delete policy", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

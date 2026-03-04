using Application.Core;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Admin.Commands;

public sealed class AssignRoles
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid UserId { get; set; }
        public required List<string> Roles { get; set; }
    }

    internal sealed class Handler(UserManager<User> userManager, RoleManager<IdentityRole<Guid>> roleManager)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            User? user = await userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
                return Result<Unit>.Failure("User not found.", 404);

            // Validate that all requested roles exist
            foreach (string roleName in request.Roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                    return Result<Unit>.Failure($"Role '{roleName}' does not exist.", 400);
            }

            // Get current roles and remove them
            List<string> currentRoles = (await userManager.GetRolesAsync(user)).ToList();
            if (currentRoles.Count > 0)
            {
                IdentityResult removeResult = await userManager.RemoveFromRolesAsync(user, currentRoles);
                if (!removeResult.Succeeded)
                    return Result<Unit>.Failure("Failed to remove current roles.", 400);
            }

            // Add new roles
            IdentityResult addResult = await userManager.AddToRolesAsync(user, request.Roles);
            if (!addResult.Succeeded)
                return Result<Unit>.Failure("Failed to assign roles.", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

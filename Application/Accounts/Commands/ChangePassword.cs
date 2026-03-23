using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Accounts.Commands;

public sealed class ChangePassword
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required string UserId { get; set; }
        public required string CurrentPassword { get; set; }
        public required string NewPassword { get; set; }
        public required string ConfirmPassword { get; set; }
    }

    internal sealed class Handler(
        UserManager<User> userManager) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            // Find user by ID
            User? user = await userManager.FindByIdAsync(request.UserId);

            if (user == null)
            {
                return Result<Unit>.Failure("User not found.", 404);
            }

            // Verify current password is correct
            bool passwordValid = await userManager.CheckPasswordAsync(user, request.CurrentPassword);
            if (!passwordValid)
            {
                return Result<Unit>.Failure("Current password is incorrect.", 401);
            }

            // Check that passwords match
            if (request.NewPassword != request.ConfirmPassword)
            {
                return Result<Unit>.Failure("New passwords do not match.", 400);
            }

            // Check that new password is different from current
            if (request.CurrentPassword == request.NewPassword)
            {
                return Result<Unit>.Failure("New password must be different from your current password.", 400);
            }

            // Change the password
            IdentityResult result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

            if (!result.Succeeded)
            {
                string errorMessage = result.Errors.FirstOrDefault()?.Description ?? "Failed to change password.";
                return Result<Unit>.Failure(errorMessage, 400);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

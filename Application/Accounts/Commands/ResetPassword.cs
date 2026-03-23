using Application.Core;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Accounts.Commands;

public sealed class ResetPassword
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required string Email { get; set; }
        public required string Token { get; set; }
        public required string NewPassword { get; set; }
        public required string ConfirmPassword { get; set; }
    }

    internal sealed class Handler(UserManager<User> userManager) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            // Find user by email
            User? user = await userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                return Result<Unit>.Failure("User not found.", 404);
            }

            // Token is already decoded by browser when reading from URL params,
            // so we use it as-is without additional decoding
            string decodedToken = request.Token;

            // Reset password using the token
            IdentityResult result = await userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);

            if (!result.Succeeded)
            {
                // Token might be invalid or expired
                string errorMessage = result.Errors.FirstOrDefault()?.Description ?? "Failed to reset password. Token may have expired.";
                return Result<Unit>.Failure(errorMessage, 400);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

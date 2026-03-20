using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Application.Accounts.Commands;

public sealed class ForgotPassword
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required string Email { get; set; }
    }

    internal sealed class Handler(
        UserManager<User> userManager,
        IEmailService emailService,
        IOptions<EmailSettings> emailSettings) : IRequestHandler<Command, Result<Unit>>
    {
        private readonly EmailSettings _settings = emailSettings.Value;

        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            // Find user by email
            User? user = await userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                // For security: don't expose whether email exists or not
                // Return success to prevent email enumeration attacks
                return Result<Unit>.Success(Unit.Value);
            }

            // Generate password reset token
            string resetToken = await userManager.GeneratePasswordResetTokenAsync(user);

            // Encode token for URL (make it safe to pass in URL)
            string encodedToken = System.Web.HttpUtility.UrlEncode(resetToken);

            // Build reset link params using configured frontend URL
            // Frontend will construct: https://glasses-ecommerce.azurewebsites.net/reset-password?email={email}&token={token}
            string resetLinkParams = $"email={System.Web.HttpUtility.UrlEncode(user.Email ?? "")}&token={encodedToken}";

            if (string.IsNullOrWhiteSpace(user.Email))
            {
                return Result<Unit>.Success(Unit.Value); // Can't send email without address
            }

            // Send password recovery email
            string userName = user.DisplayName ?? user.Email ?? user.UserName ?? "User";
            bool emailSent = await emailService.SendPasswordRecoveryEmailAsync(
                user.Email,
                userName,
                resetLinkParams,
                cancellationToken);

            if (!emailSent)
            {
                return Result<Unit>.Failure("Failed to send password recovery email. Please try again later.", 500);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

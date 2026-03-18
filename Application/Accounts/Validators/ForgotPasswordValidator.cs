using Application.Accounts.Commands;
using FluentValidation;

namespace Application.Accounts.Validators;

public sealed class ForgotPasswordValidator : AbstractValidator<ForgotPassword.Command>
{
    public ForgotPasswordValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email must be a valid email address.");
    }
}

using Application.Admin.Commands;
using FluentValidation;

namespace Application.Admin.Validators;

public sealed class AssignRolesValidator : AbstractValidator<AssignRoles.Command>
{
    public AssignRolesValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.Roles)
            .NotNull().WithMessage("Roles list is required.")
            .NotEmpty().WithMessage("At least one role must be assigned.");

        When(x => x.Roles is not null, () =>
        {
            RuleForEach(x => x.Roles)
                .Must(roleName => !string.IsNullOrWhiteSpace(roleName))
                .WithMessage("Roles list contains invalid role names.");
        });
    }
}

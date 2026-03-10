using Application.FeatureToggles.Commands;
using FluentValidation;

namespace Application.FeatureToggles.Validators;

public sealed class SetFeatureToggleEnabledValidator : AbstractValidator<SetFeatureToggleEnabled.Command>
{
    public SetFeatureToggleEnabledValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Feature toggle ID is required.");
    }
}

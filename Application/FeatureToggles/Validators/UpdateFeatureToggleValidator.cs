using Application.FeatureToggles.Commands;
using FluentValidation;

namespace Application.FeatureToggles.Validators;

public sealed class UpdateFeatureToggleValidator : AbstractValidator<UpdateFeatureToggle.Command>
{
    public UpdateFeatureToggleValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Feature toggle ID is required.");

        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.FeatureName)
                .NotEmpty().WithMessage("Feature name is required.")
                .MaximumLength(100).WithMessage("Feature name cannot exceed 100 characters.");

            RuleFor(x => x.Dto.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Dto.Description));

            RuleFor(x => x.Dto.Scope)
                .MaximumLength(50).WithMessage("Scope cannot exceed 50 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Dto.Scope));

            RuleFor(x => x.Dto.ScopeValue)
                .MaximumLength(200).WithMessage("ScopeValue cannot exceed 200 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Dto.ScopeValue));

            RuleFor(x => x.Dto.ScopeValue)
                .NotEmpty().WithMessage("ScopeValue is required when Scope is specified.")
                .When(x => !string.IsNullOrWhiteSpace(x.Dto.Scope));

            RuleFor(x => x.Dto.Scope)
                .NotEmpty().WithMessage("Scope is required when ScopeValue is specified.")
                .When(x => !string.IsNullOrWhiteSpace(x.Dto.ScopeValue));

            RuleFor(x => x.Dto.EffectiveFrom)
                .NotNull().WithMessage("EffectiveFrom must be provided if EffectiveTo is set.")
                .When(x => x.Dto.EffectiveTo.HasValue);

            RuleFor(x => x.Dto.EffectiveTo)
                .GreaterThan(x => x.Dto.EffectiveFrom)
                .WithMessage("EffectiveTo must be after EffectiveFrom.")
                .When(x => x.Dto.EffectiveTo.HasValue && x.Dto.EffectiveFrom.HasValue);
        });
    }
}

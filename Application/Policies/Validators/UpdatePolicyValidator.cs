using Application.Policies.Commands;
using FluentValidation;

namespace Application.Policies.Validators;

public sealed class UpdatePolicyValidator : AbstractValidator<UpdatePolicy.Command>
{
    public UpdatePolicyValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Policy id is required.");
        
        RuleFor(x => x.Dto).NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.PolicyName)
                .NotEmpty().WithMessage("Policy name is required.")
                .MaximumLength(200).WithMessage("Policy name must not exceed 200 characters.");

            RuleFor(x => x.Dto.ReturnWindowDays)
                .InclusiveBetween(0, 365).WithMessage("Return window must be between 0 and 365 days.")
                .When(x => x.Dto.ReturnWindowDays.HasValue);

            RuleFor(x => x.Dto.WarrantyMonths)
                .InclusiveBetween(0, 120).WithMessage("Warranty months must be between 0 and 120.")
                .When(x => x.Dto.WarrantyMonths.HasValue);

            RuleFor(x => x.Dto.MinOrderAmount)
                .GreaterThanOrEqualTo(0).WithMessage("Minimum order amount must be non-negative.")
                .When(x => x.Dto.MinOrderAmount.HasValue);

            RuleFor(x => x.Dto.RefundOnlyMaxAmount)
                .GreaterThanOrEqualTo(0).WithMessage("RefundOnlyMaxAmount must be non-negative.")
                .When(x => x.Dto.RefundOnlyMaxAmount.HasValue);

            RuleFor(x => x.Dto.RefundWindowDays)
                .InclusiveBetween(0, 365).WithMessage("RefundWindowDays must be between 0 and 365 days.")
                .When(x => x.Dto.RefundWindowDays.HasValue);

            RuleFor(x => x.Dto.EffectiveFrom)
                .NotEmpty().WithMessage("Effective from date is required.");
                
            RuleFor(x => x.Dto.EffectiveTo)
                .GreaterThan(x => x.Dto.EffectiveFrom).WithMessage("EffectiveTo must be greater than EffectiveFrom.")
                .When(x => x.Dto.EffectiveTo.HasValue);
        });
    }
}

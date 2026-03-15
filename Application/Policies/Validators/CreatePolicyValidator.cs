using Application.Policies.Commands;
using Domain;
using FluentValidation;

namespace Application.Policies.Validators;

public sealed class CreatePolicyValidator : AbstractValidator<CreatePolicy.Command>
{
    public CreatePolicyValidator()
    {
        RuleFor(x => x.Dto).NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.PolicyType)
                .IsInEnum().WithMessage("Invalid policy type.")
                .NotEqual(PolicyType.Unknown).WithMessage("Policy type is required.");

            RuleFor(x => x.Dto.PolicyName)
                .NotEmpty().WithMessage("Policy name is required.")
                .MaximumLength(200).WithMessage("Policy name must not exceed 200 characters.");

            RuleFor(x => x.Dto.ReturnWindowDays)
                .InclusiveBetween(0, 365).WithMessage("Return window must be between 0 and 365 days.")
                .When(x => x.Dto.ReturnWindowDays.HasValue);

            When(x => x.Dto.PolicyType == PolicyType.Return, () =>
            {
                RuleFor(x => x.Dto.ReturnWindowDays)
                    .NotNull().WithMessage("ReturnWindowDays is required for Return policies.");
            });
            When(x => x.Dto.PolicyType != PolicyType.Return && x.Dto.PolicyType != PolicyType.Unknown, () =>
            {
                RuleFor(x => x.Dto.ReturnWindowDays)
                    .Null().WithMessage("ReturnWindowDays must be null for non-Return policies.");
            });

            RuleFor(x => x.Dto.WarrantyMonths)
                .InclusiveBetween(0, 120).WithMessage("Warranty months must be between 0 and 120.")
                .When(x => x.Dto.WarrantyMonths.HasValue);

            When(x => x.Dto.PolicyType == PolicyType.Warranty, () =>
            {
                RuleFor(x => x.Dto.WarrantyMonths)
                    .NotNull().WithMessage("WarrantyMonths is required for Warranty policies.");
            });
            When(x => x.Dto.PolicyType != PolicyType.Warranty && x.Dto.PolicyType != PolicyType.Unknown, () =>
            {
                RuleFor(x => x.Dto.WarrantyMonths)
                    .Null().WithMessage("WarrantyMonths must be null for non-Warranty policies.");
            });

            RuleFor(x => x.Dto.MinOrderAmount)
                .GreaterThanOrEqualTo(0).WithMessage("Minimum order amount must be non-negative.")
                .When(x => x.Dto.MinOrderAmount.HasValue);

            RuleFor(x => x.Dto.RefundOnlyMaxAmount)
                .GreaterThanOrEqualTo(0).WithMessage("RefundOnlyMaxAmount must be non-negative.")
                .When(x => x.Dto.RefundOnlyMaxAmount.HasValue);

            RuleFor(x => x.Dto.RefundWindowDays)
                .InclusiveBetween(0, 365).WithMessage("RefundWindowDays must be between 0 and 365 days.")
                .When(x => x.Dto.RefundWindowDays.HasValue);

            When(x => x.Dto.PolicyType != PolicyType.Refund && x.Dto.PolicyType != PolicyType.Unknown, () =>
            {
                RuleFor(x => x.Dto.RefundOnlyMaxAmount)
                    .Null().WithMessage("RefundOnlyMaxAmount must be null for non-Refund policies.");

                RuleFor(x => x.Dto.RefundWindowDays)
                    .Null().WithMessage("RefundWindowDays must be null for non-Refund policies.");
            });

            RuleFor(x => x.Dto.EffectiveFrom)
                .NotEmpty().WithMessage("Effective from date is required.");
                
            RuleFor(x => x.Dto.EffectiveTo)
                .GreaterThan(x => x.Dto.EffectiveFrom).WithMessage("EffectiveTo must be greater than EffectiveFrom.")
                .When(x => x.Dto.EffectiveTo.HasValue);
        });
    }
}

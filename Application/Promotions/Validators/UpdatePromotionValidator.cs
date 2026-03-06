using Application.Promotions.Commands;
using FluentValidation;

namespace Application.Promotions.Validators;

public sealed class UpdatePromotionValidator : AbstractValidator<UpdatePromotion.Command>
{
    public UpdatePromotionValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Promotion Id is required.");

        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.PromoName)
                .NotEmpty().WithMessage("Promo name is required.")
                .MaximumLength(200).WithMessage("Promo name must not exceed 200 characters.");

            RuleFor(x => x.Dto.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters.")
                .When(x => x.Dto.Description != null);

            // MaxDiscountValue rules (type is immutable, so this is advisory but still enforced for consistency)
            When(x => x.Dto.MaxDiscountValue.HasValue, () =>
            {
                RuleFor(x => x.Dto.MaxDiscountValue!.Value)
                    .GreaterThan(0).WithMessage("MaxDiscountValue must be greater than 0.");
            });

            RuleFor(x => x.Dto.ValidTo)
                .GreaterThan(x => x.Dto.ValidFrom)
                .WithMessage("ValidTo must be after ValidFrom.");

            When(x => x.Dto.UsageLimit.HasValue, () =>
            {
                RuleFor(x => x.Dto.UsageLimit!.Value)
                    .GreaterThanOrEqualTo(1).WithMessage("UsageLimit must be at least 1.");
            });

            When(x => x.Dto.UsageLimitPerCustomer.HasValue, () =>
            {
                RuleFor(x => x.Dto.UsageLimitPerCustomer!.Value)
                    .GreaterThanOrEqualTo(1).WithMessage("UsageLimitPerCustomer must be at least 1.");
            });

            When(x => x.Dto.UsageLimit.HasValue && x.Dto.UsageLimitPerCustomer.HasValue, () =>
            {
                RuleFor(x => x.Dto.UsageLimitPerCustomer!.Value)
                    .LessThanOrEqualTo(x => x.Dto.UsageLimit!.Value)
                    .WithMessage("UsageLimitPerCustomer cannot exceed UsageLimit.");
            });
        });
    }
}

using Application.Promotions.Commands;
using Domain;
using FluentValidation;

namespace Application.Promotions.Validators;

public sealed class CreatePromotionValidator : AbstractValidator<CreatePromotion.Command>
{
    public CreatePromotionValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.PromoCode)
                .NotEmpty().WithMessage("Promo code is required.")
                .MinimumLength(3).WithMessage("Promo code must be at least 3 characters.")
                .MaximumLength(50).WithMessage("Promo code must not exceed 50 characters.")
                .Matches(@"^[A-Za-z0-9\-]+$").WithMessage("Promo code may only contain letters, digits, and hyphens.");

            RuleFor(x => x.Dto.PromoName)
                .NotEmpty().WithMessage("Promo name is required.")
                .MaximumLength(200).WithMessage("Promo name must not exceed 200 characters.");

            RuleFor(x => x.Dto.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters.")
                .When(x => x.Dto.Description != null);

            RuleFor(x => x.Dto.PromotionType)
                .IsInEnum().WithMessage("Invalid promotion type.");

            // DiscountValue rules per type
            When(x => x.Dto.PromotionType == PromotionType.Percentage, () =>
            {
                RuleFor(x => x.Dto.DiscountValue)
                    .GreaterThan(0).WithMessage("Discount value must be greater than 0 for Percentage type.")
                    .LessThanOrEqualTo(100).WithMessage("Percentage discount cannot exceed 100.");
            });

            When(x => x.Dto.PromotionType == PromotionType.FixedAmount, () =>
            {
                RuleFor(x => x.Dto.DiscountValue)
                    .GreaterThan(0).WithMessage("Discount value must be greater than 0 for FixedAmount type.");
            });

            When(x => x.Dto.PromotionType == PromotionType.FreeShipping, () =>
            {
                RuleFor(x => x.Dto.DiscountValue)
                    .Equal(0).WithMessage("Discount value must be 0 for FreeShipping type.");
            });

            // MaxDiscountValue only valid for Percentage type
            When(x => x.Dto.MaxDiscountValue.HasValue, () =>
            {
                RuleFor(x => x.Dto.PromotionType)
                    .Equal(PromotionType.Percentage)
                    .WithMessage("MaxDiscountValue is only applicable for Percentage promotions.");

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

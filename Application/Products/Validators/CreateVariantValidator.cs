using Application.Products.Commands;
using FluentValidation;

namespace Application.Products.Validators;

public sealed class CreateVariantValidator : AbstractValidator<AddVariant.Command>
{
    public CreateVariantValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.SKU)
                .NotEmpty().WithMessage("SKU is required.")
                .MaximumLength(100).WithMessage("SKU must not exceed 100 characters.");

            // Domain CHECK constraint allows Price >= 0 (e.g. free service variants)
            RuleFor(x => x.Dto.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Price must be greater than or equal to 0.");

            // CompareAtPrice (original price) should be >= Price (sale price)
            RuleFor(x => x.Dto.CompareAtPrice)
                .GreaterThanOrEqualTo(x => x.Dto.Price)
                .WithMessage("Compare-at price must be greater than or equal to the selling price.")
                .When(x => x.Dto.CompareAtPrice.HasValue);

            RuleFor(x => x.Dto.FrameWidth)
                .GreaterThan(0).WithMessage("Frame width must be greater than 0.")
                .When(x => x.Dto.FrameWidth.HasValue);

            RuleFor(x => x.Dto.LensWidth)
                .GreaterThan(0).WithMessage("Lens width must be greater than 0.")
                .When(x => x.Dto.LensWidth.HasValue);

            RuleFor(x => x.Dto.BridgeWidth)
                .GreaterThan(0).WithMessage("Bridge width must be greater than 0.")
                .When(x => x.Dto.BridgeWidth.HasValue);

            RuleFor(x => x.Dto.TempleLength)
                .GreaterThan(0).WithMessage("Temple length must be greater than 0.")
                .When(x => x.Dto.TempleLength.HasValue);
        });
    }
}

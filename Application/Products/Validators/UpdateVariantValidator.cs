using Application.Products.Commands;
using FluentValidation;

namespace Application.Products.Validators;

public sealed class UpdateVariantValidator : AbstractValidator<UpdateVariant.Command>
{
    public UpdateVariantValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            // At least one field must be provided
            RuleFor(x => x.Dto)
                .Must(dto =>
                    !string.IsNullOrWhiteSpace(dto.SKU) ||
                    !string.IsNullOrWhiteSpace(dto.VariantName) ||
                    !string.IsNullOrWhiteSpace(dto.Color) ||
                    !string.IsNullOrWhiteSpace(dto.Size) ||
                    !string.IsNullOrWhiteSpace(dto.Material) ||
                    dto.FrameWidth.HasValue ||
                    dto.LensWidth.HasValue ||
                    dto.BridgeWidth.HasValue ||
                    dto.TempleLength.HasValue ||
                    dto.Price.HasValue ||
                    dto.CompareAtPrice.HasValue ||
                    dto.IsActive.HasValue)
                .WithMessage("At least one field must be provided for update.");

            RuleFor(x => x.Dto.SKU)
                .MaximumLength(100).WithMessage("SKU must not exceed 100 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Dto.SKU));

            RuleFor(x => x.Dto.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Price must be greater than or equal to 0.")
                .When(x => x.Dto.Price.HasValue);

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

            // Cross-field: CompareAtPrice must be >= Price when both are provided
            RuleFor(x => x.Dto.CompareAtPrice)
                .GreaterThanOrEqualTo(x => x.Dto.Price!.Value)
                .WithMessage("Compare-at price must be greater than or equal to the selling price.")
                .When(x => x.Dto.CompareAtPrice.HasValue && x.Dto.Price.HasValue);
        });
    }
}

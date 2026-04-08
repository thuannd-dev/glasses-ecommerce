using Application.Carts.Commands;
using FluentValidation;

namespace Application.Carts.Validators;

public sealed class AddItemToCartValidator : AbstractValidator<AddItemToCart.Command>
{
    public AddItemToCartValidator()
    {
        RuleFor(x => x.AddCartItemDto.ProductVariantId)
            .NotEmpty()
            .WithMessage("Product variant ID is required.");

        RuleFor(x => x.AddCartItemDto.Quantity)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0.")
            .LessThanOrEqualTo(999)
            .WithMessage("Quantity cannot exceed 999 items.");

        // ── Prescription field validation (only when lens selected) ──────────
        When(x => x.AddCartItemDto.LensVariantId.HasValue, () =>
        {
            // CYL must be ≤ 0 (negative cylinder convention)
            RuleFor(x => x.AddCartItemDto.CylOD)
                .LessThanOrEqualTo(0)
                .WithMessage("Right eye CYL must be ≤ 0.")
                .When(x => x.AddCartItemDto.CylOD.HasValue);

            RuleFor(x => x.AddCartItemDto.CylOS)
                .LessThanOrEqualTo(0)
                .WithMessage("Left eye CYL must be ≤ 0.")
                .When(x => x.AddCartItemDto.CylOS.HasValue);

            // AXIS must be 0–180
            RuleFor(x => x.AddCartItemDto.AxisOD)
                .InclusiveBetween(0, 180)
                .WithMessage("Right eye AXIS must be between 0 and 180.")
                .When(x => x.AddCartItemDto.AxisOD.HasValue);

            RuleFor(x => x.AddCartItemDto.AxisOS)
                .InclusiveBetween(0, 180)
                .WithMessage("Left eye AXIS must be between 0 and 180.")
                .When(x => x.AddCartItemDto.AxisOS.HasValue);

            // PD values must be positive
            RuleFor(x => x.AddCartItemDto.PdOD)
                .GreaterThan(0).WithMessage("Right eye PD must be greater than 0.")
                .When(x => x.AddCartItemDto.PdOD.HasValue);

            RuleFor(x => x.AddCartItemDto.PdOS)
                .GreaterThan(0).WithMessage("Left eye PD must be greater than 0.")
                .When(x => x.AddCartItemDto.PdOS.HasValue);

            RuleFor(x => x.AddCartItemDto.Pd)
                .GreaterThan(0).WithMessage("PD must be greater than 0.")
                .When(x => x.AddCartItemDto.Pd.HasValue);
        });
    }
}

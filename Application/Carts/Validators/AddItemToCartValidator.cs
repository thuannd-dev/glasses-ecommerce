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

        // SelectedCoatingIds: null = no coating (valid), [] = empty list (invalid ambiguity)
        // Must be either null or a non-empty list with actual IDs.
        RuleFor(x => x.AddCartItemDto.SelectedCoatingIds)
            .Must(ids => ids == null || ids.Count > 0)
            .WithMessage("SelectedCoatingIds must be either null (no coating) or a non-empty list. Use null to indicate no coating selection.");

        // Bare frame validation: when no lens variant is selected, strictly reject ANY lens-related input.
        When(x => !x.AddCartItemDto.LensVariantId.HasValue, () =>
        {
            RuleFor(x => x.AddCartItemDto)
                .Must(dto => !(
                    dto.SelectedCoatingIds is { Count: > 0 } ||
                    dto.SphOD.HasValue || dto.CylOD.HasValue || dto.AxisOD.HasValue || dto.AddOD.HasValue || dto.PdOD.HasValue ||
                    dto.SphOS.HasValue || dto.CylOS.HasValue || dto.AxisOS.HasValue || dto.AddOS.HasValue || dto.PdOS.HasValue ||
                    dto.Pd.HasValue))
                .WithMessage("Lens prescription and coating selections require a lens variant.")
                .WithName("BareFrameRequirements");
        });

        // ── Rules only applicable when a lens variant is provided ────────────
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

            // AXIS general range 0–180 (ophthalmic convention)
            RuleFor(x => x.AddCartItemDto.AxisOD)
                .InclusiveBetween(0, 180)
                .WithMessage("Right eye AXIS must be between 0 and 180.")
                .When(x => x.AddCartItemDto.AxisOD.HasValue);

            RuleFor(x => x.AddCartItemDto.AxisOS)
                .InclusiveBetween(0, 180)
                .WithMessage("Left eye AXIS must be between 0 and 180.")
                .When(x => x.AddCartItemDto.AxisOS.HasValue);

            // CYL↔AXIS cross-field: CYL ≠ 0 requires AXIS (incomplete prescription)
            RuleFor(x => x.AddCartItemDto.AxisOD)
                .NotNull()
                .WithMessage("Right eye AXIS is required when CYL is not zero.")
                .When(x => x.AddCartItemDto.CylOD.HasValue && x.AddCartItemDto.CylOD.Value != 0);

            RuleFor(x => x.AddCartItemDto.AxisOS)
                .NotNull()
                .WithMessage("Left eye AXIS is required when CYL is not zero.")
                .When(x => x.AddCartItemDto.CylOS.HasValue && x.AddCartItemDto.CylOS.Value != 0);

            // CYL↔AXIS cross-field: AXIS without CYL (or CYL = 0) is clinically meaningless
            RuleFor(x => x.AddCartItemDto.AxisOD)
                .Null()
                .WithMessage("Right eye AXIS is only applicable when CYL is provided and not zero.")
                .When(x => x.AddCartItemDto.AxisOD.HasValue
                        && (!x.AddCartItemDto.CylOD.HasValue || x.AddCartItemDto.CylOD.Value == 0));

            RuleFor(x => x.AddCartItemDto.AxisOS)
                .Null()
                .WithMessage("Left eye AXIS is only applicable when CYL is provided and not zero.")
                .When(x => x.AddCartItemDto.AxisOS.HasValue
                        && (!x.AddCartItemDto.CylOS.HasValue || x.AddCartItemDto.CylOS.Value == 0));

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

using Application.Products.Commands;
using Domain;
using FluentValidation;

namespace Application.Products.Validators;

public sealed class SetLensVariantAttributeValidator : AbstractValidator<SetLensVariantAttribute.Command>
{
    public SetLensVariantAttributeValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            // SPH range
            RuleFor(x => x.Dto.SphMin)
                .LessThanOrEqualTo(x => x.Dto.SphMax)
                .WithMessage("SphMin must be ≤ SphMax.");

            // CYL — negative cylinder convention
            RuleFor(x => x.Dto.CylMin)
                .LessThanOrEqualTo(0)
                .WithMessage("CylMin must be ≤ 0 (negative cylinder convention).");

            RuleFor(x => x.Dto.CylMax)
                .LessThanOrEqualTo(0)
                .WithMessage("CylMax must be ≤ 0 (negative cylinder convention).");

            RuleFor(x => x.Dto.CylMin)
                .LessThanOrEqualTo(x => x.Dto.CylMax)
                .WithMessage("CylMin must be ≤ CylMax.");

            // AXIS — 0–180 degrees
            RuleFor(x => x.Dto.AxisMin)
                .InclusiveBetween(0, 180)
                .WithMessage("AxisMin must be between 0 and 180.");

            RuleFor(x => x.Dto.AxisMax)
                .InclusiveBetween(0, 180)
                .WithMessage("AxisMax must be between 0 and 180.");

            RuleFor(x => x.Dto.AxisMin)
                .LessThanOrEqualTo(x => x.Dto.AxisMax)
                .WithMessage("AxisMin must be ≤ AxisMax.");

            // Index
            RuleFor(x => x.Dto.Index)
                .GreaterThan(0)
                .WithMessage("Index must be greater than 0.");

            // ADD — chỉ dùng cho Progressive / Bifocal
            RuleFor(x => x.Dto.AddMin)
                .Null()
                .WithMessage("ADD range is not applicable for SingleVision lens design.")
                .When(x => x.Dto.LensDesign == LensDesign.SingleVision);

            RuleFor(x => x.Dto.AddMax)
                .Null()
                .WithMessage("ADD range is not applicable for SingleVision lens design.")
                .When(x => x.Dto.LensDesign == LensDesign.SingleVision);

            RuleFor(x => x.Dto)
                .Must(dto => dto.LensDesign == LensDesign.SingleVision
                    || (dto.AddMin.HasValue == dto.AddMax.HasValue))
                .WithMessage("ADD range must include both AddMin and AddMax, or neither, for non-SingleVision lens designs.")
                .WithName("AddRangeConsistency");

            RuleFor(x => x.Dto)
                .Must(dto => dto.LensDesign == LensDesign.SingleVision
                    || !dto.AddMin.HasValue
                    || !dto.AddMax.HasValue
                    || dto.AddMin.Value <= dto.AddMax.Value)
                .WithMessage("AddMin must be ≤ AddMax.")
                .WithName("AddRangeValues");
        });
    }
}

using Application.Products.Commands;
using FluentValidation;

namespace Application.Products.Validators;

public sealed class UpdateLensCoatingOptionValidator : AbstractValidator<UpdateLensCoatingOption.Command>
{
    public UpdateLensCoatingOptionValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.CoatingName)
                .NotEmpty().WithMessage("Coating name must not be empty when provided.")
                .MaximumLength(100).WithMessage("Coating name must not exceed 100 characters.")
                .When(x => x.Dto.CoatingName != null);

            RuleFor(x => x.Dto.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters.")
                .When(x => x.Dto.Description != null);

            RuleFor(x => x.Dto.ExtraPrice)
                .GreaterThanOrEqualTo(0).WithMessage("ExtraPrice must be ≥ 0.")
                .When(x => x.Dto.ExtraPrice.HasValue);
        });
    }
}

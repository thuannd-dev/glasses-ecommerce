using Application.Products.Commands;
using FluentValidation;

namespace Application.Products.Validators;

public sealed class AddLensCoatingOptionValidator : AbstractValidator<AddLensCoatingOption.Command>
{
    public AddLensCoatingOptionValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.CoatingName)
                .NotEmpty().WithMessage("Coating name is required.")
                .MaximumLength(100).WithMessage("Coating name must not exceed 100 characters.");

            RuleFor(x => x.Dto.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters.")
                .When(x => x.Dto.Description != null);

            RuleFor(x => x.Dto.ExtraPrice)
                .GreaterThanOrEqualTo(0).WithMessage("ExtraPrice must be ≥ 0.");
        });
    }
}

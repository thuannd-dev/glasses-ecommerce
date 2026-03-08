using Application.Products.Commands;
using FluentValidation;

namespace Application.Products.Validators;

public sealed class AddProductImageValidator : AbstractValidator<AddProductImage.Command>
{
    public AddProductImageValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.ImageUrl)
                .NotEmpty().WithMessage("ImageUrl is required.")
                .MaximumLength(500).WithMessage("ImageUrl must not exceed 500 characters.");

            RuleFor(x => x.Dto.AltText)
                .MaximumLength(200).WithMessage("AltText must not exceed 200 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Dto.AltText));
        });
    }
}

using Application.Products.Commands;
using Domain;
using FluentValidation;

namespace Application.Products.Validators;

public sealed class CreateProductValidator : AbstractValidator<CreateProduct.Command>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.CategoryId)
                .NotEmpty().WithMessage("Category is required.");

            RuleFor(x => x.Dto.ProductName)
                .NotEmpty().WithMessage("Product name is required.")
                .MaximumLength(200).WithMessage("Product name must not exceed 200 characters.");

            RuleFor(x => x.Dto.Type)
                .IsInEnum().WithMessage("Product type is invalid.")
                .Must(t => t != ProductType.Unknown)
                .WithMessage("Product type must be specified (Frame, Lens, Combo, Accessory, or Service).");

            RuleFor(x => x.Dto.Status)
                .IsInEnum().WithMessage("Product status is invalid.");
        });
    }
}

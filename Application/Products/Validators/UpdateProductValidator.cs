using Application.Products.Commands;
using FluentValidation;

namespace Application.Products.Validators;

public sealed class UpdateProductValidator : AbstractValidator<UpdateProduct.Command>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            // At least one field must be provided
            RuleFor(x => x.Dto)
                .Must(dto =>
                    dto.CategoryId.HasValue ||
                    !string.IsNullOrWhiteSpace(dto.ProductName) ||
                    !string.IsNullOrWhiteSpace(dto.Description) ||
                    !string.IsNullOrWhiteSpace(dto.Brand) ||
                    dto.Status.HasValue)
                .WithMessage("At least one field must be provided for update.");

            RuleFor(x => x.Dto.ProductName)
                .MaximumLength(200).WithMessage("Product name must not exceed 200 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Dto.ProductName));
        });
    }
}

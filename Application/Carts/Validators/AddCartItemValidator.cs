using Application.Carts.DTOs;
using FluentValidation;

namespace Application.Carts.Validators;

public sealed class AddCartItemValidator : AbstractValidator<AddCartItemDto>
{
    public AddCartItemValidator()
    {
        RuleFor(x => x.ProductVariantId)
            .NotEmpty()
            .WithMessage("Product variant ID is required.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0.")
            .LessThanOrEqualTo(999)
            .WithMessage("Quantity cannot exceed 999 items.");
    }
}

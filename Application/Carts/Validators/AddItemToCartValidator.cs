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
    }
}

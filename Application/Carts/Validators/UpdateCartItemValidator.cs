using Application.Carts.Commands;
using FluentValidation;

namespace Application.Carts.Validators;

public sealed class UpdateCartItemValidator : AbstractValidator<UpdateCartItem.Command>
{
    public UpdateCartItemValidator()
    {
        RuleFor(x => x.CartItemId)
            .NotEmpty()
            .WithMessage("Cart item ID is required.");

        RuleFor(x => x.UpdateCartItemDto.Quantity)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0.")
            .LessThanOrEqualTo(999)
            .WithMessage("Quantity cannot exceed 999 items.");
    }
}

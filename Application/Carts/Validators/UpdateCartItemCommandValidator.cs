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

        RuleFor(x => x.UpdateCartItemDto)
            .NotNull()
            .WithMessage("Request data is required.")
            .SetValidator(new UpdateCartItemDtoValidator());
    }
}

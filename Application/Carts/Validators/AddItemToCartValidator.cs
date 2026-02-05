using Application.Carts.Commands;
using FluentValidation;

namespace Application.Carts.Validators;

public sealed class AddItemToCartValidator : AbstractValidator<AddItemToCart.Command>
{
    public AddItemToCartValidator()
    {
        RuleFor(x => x.AddCartItemDto)
            .NotNull()
            .WithMessage("Request data is required.")
            .SetValidator(new AddCartItemValidator());
    }
}

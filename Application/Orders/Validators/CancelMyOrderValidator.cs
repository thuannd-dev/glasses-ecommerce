using Application.Orders.Commands;
using FluentValidation;

namespace Application.Orders.Validators;

//Validate CancelMyOrder.Command
public sealed class CancelMyOrderValidator : AbstractValidator<CancelMyOrder.Command>
{
    public CancelMyOrderValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Order ID is required.");

        RuleFor(x => x.Dto!.Reason)
            .MaximumLength(500)
            .When(x => x.Dto?.Reason != null);
    }
}

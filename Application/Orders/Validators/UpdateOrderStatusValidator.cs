using Application.Orders.Commands;
using Domain;
using FluentValidation;

namespace Application.Orders.Validators;

public sealed class UpdateOrderStatusValidator : AbstractValidator<UpdateOrderStatus.Command>
{
    public UpdateOrderStatusValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Order ID is required.");

        RuleFor(x => x.Dto.NewStatus)
            .IsInEnum()
            .Must(s => s != OrderStatus.Pending)
            .WithMessage("Cannot set status back to Pending.");

        RuleFor(x => x.Dto.Notes)
            .MaximumLength(500)
            .When(x => x.Dto.Notes != null);
    }
}

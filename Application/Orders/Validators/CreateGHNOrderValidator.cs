using Application.Orders.Commands;
using FluentValidation;

namespace Application.Orders.Validators;

public sealed class CreateGHNOrderValidator : AbstractValidator<CreateGHNOrder.Command>
{
    public CreateGHNOrderValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("OrderId is required.");

        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.Weight)
                .GreaterThan(0).WithMessage("Weight must be greater than 0.");

            RuleFor(x => x.Dto.Length)
                .GreaterThan(0).WithMessage("Length must be greater than 0.");

            RuleFor(x => x.Dto.Width)
                .GreaterThan(0).WithMessage("Width must be greater than 0.");

            RuleFor(x => x.Dto.Height)
                .GreaterThan(0).WithMessage("Height must be greater than 0.");
        });
    }
}

using Application.Inventory.Commands;
using FluentValidation;

namespace Application.Inventory.Validators;

public sealed class RecordOutboundValidator : AbstractValidator<RecordOutbound.Command>
{
    public RecordOutboundValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.OrderId)
                .NotEmpty().WithMessage("Order ID is required.");
        });
    }
}

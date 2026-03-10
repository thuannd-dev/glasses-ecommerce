using Application.AfterSales.Commands;
using FluentValidation;

namespace Application.AfterSales.Validators;

public sealed class SelectReplacementItemValidator : AbstractValidator<SelectReplacementItem.Command>
{
    public SelectReplacementItemValidator()
    {
        RuleFor(x => x.TicketId)
            .NotEmpty().WithMessage("Ticket ID is required.");

        RuleFor(x => x.ReplacementOrderItemId)
            .NotEmpty().WithMessage("Replacement item ID is required.");
    }
}

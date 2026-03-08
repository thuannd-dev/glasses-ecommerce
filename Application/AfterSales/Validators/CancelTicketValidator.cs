using Application.AfterSales.Commands;
using FluentValidation;

namespace Application.AfterSales.Validators;

public sealed class CancelTicketValidator : AbstractValidator<CancelTicket.Command>
{
    public CancelTicketValidator()
    {
        RuleFor(x => x.TicketId)
            .NotEmpty().WithMessage("Ticket ID is required.");
    }
}

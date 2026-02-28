using Application.AfterSales.Commands;
using FluentValidation;

namespace Application.AfterSales.Validators;

public sealed class RejectTicketValidator : AbstractValidator<RejectTicket.Command>
{
    public RejectTicketValidator()
    {
        RuleFor(x => x.TicketId)
            .NotEmpty().WithMessage("Ticket ID is required.");

        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.Reason)
                .NotEmpty().WithMessage("Rejection reason is required.")
                .MaximumLength(1000).WithMessage("Reason must not exceed 1000 characters.");
        });
    }
}

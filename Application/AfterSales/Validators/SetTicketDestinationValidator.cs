using Application.AfterSales.Commands;
using Application.AfterSales.DTOs;
using FluentValidation;

namespace Application.AfterSales.Validators;

public sealed class SetTicketDestinationValidator : AbstractValidator<SetTicketDestination.Command>
{
    public SetTicketDestinationValidator()
    {
        RuleFor(x => x.TicketId)
            .NotEmpty().WithMessage("Ticket ID is required.");

        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.Destination)
                .NotEmpty().WithMessage("Destination is required.")
                .Must(x => x == "Replace" || x == "Reject")
                .WithMessage("Destination must be 'Replace' or 'Reject'.");

            RuleFor(x => x.Dto.Notes)
                .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters.");
        });
    }
}

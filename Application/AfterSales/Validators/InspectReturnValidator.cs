using Application.AfterSales.Commands;
using FluentValidation;

namespace Application.AfterSales.Validators;

public sealed class InspectReturnValidator : AbstractValidator<InspectReturn.Command>
{
    public InspectReturnValidator()
    {
        RuleFor(x => x.TicketId)
            .NotEmpty().WithMessage("Ticket ID is required.");

        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.Notes)
                .NotEmpty().WithMessage("Inspection notes are required.")
                .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");
        });
    }
}

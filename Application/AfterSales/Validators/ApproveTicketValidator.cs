using Application.AfterSales.Commands;
using Domain;
using FluentValidation;

namespace Application.AfterSales.Validators;

public sealed class ApproveTicketValidator : AbstractValidator<ApproveTicket.Command>
{
    public ApproveTicketValidator()
    {
        RuleFor(x => x.TicketId)
            .NotEmpty().WithMessage("Ticket ID is required.");

        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.ResolutionType)
                .IsInEnum()
                .WithMessage("ResolutionType must be a valid value.");

            // RefundAmount is required and must be positive when resolving with RefundOnly
            RuleFor(x => x.Dto.RefundAmount)
                .NotNull().WithMessage("Refund amount is required for RefundOnly resolution.")
                .GreaterThan(0).WithMessage("Refund amount must be greater than zero.")
                .When(x => x.Dto.ResolutionType == TicketResolutionType.RefundOnly);

            RuleFor(x => x.Dto.StaffNotes)
                .MaximumLength(2000).When(x => !string.IsNullOrWhiteSpace(x.Dto.StaffNotes))
                .WithMessage("Staff notes must not exceed 2000 characters.");
        });
    }
}

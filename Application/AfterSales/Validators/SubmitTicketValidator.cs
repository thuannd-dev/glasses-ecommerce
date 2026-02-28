using Application.AfterSales.Commands;
using Domain;
using FluentValidation;

namespace Application.AfterSales.Validators;

public sealed class SubmitTicketValidator : AbstractValidator<SubmitTicket.Command>
{
    public SubmitTicketValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.OrderId)
                .NotEmpty().WithMessage("Order ID is required.");

            RuleFor(x => x.Dto.TicketType)
                .IsInEnum()
                .Must(t => t != AfterSalesTicketType.Unknown)
                .WithMessage("TicketType must be Return, Warranty, or Refund.");

            RuleFor(x => x.Dto.Reason)
                .NotEmpty().WithMessage("Reason is required.")
                .MaximumLength(1000).WithMessage("Reason must not exceed 1000 characters.");

            RuleFor(x => x.Dto.RefundAmount)
                .GreaterThan(0).When(x => x.Dto.RefundAmount.HasValue)
                .WithMessage("Refund amount must be greater than zero.");

            RuleForEach(x => x.Dto.Attachments).ChildRules(a =>
            {
                a.RuleFor(att => att.FileName)
                    .NotEmpty().WithMessage("Attachment file name is required.");
                a.RuleFor(att => att.FileUrl)
                    .NotEmpty().WithMessage("Attachment file URL is required.");
            });
        });
    }
}

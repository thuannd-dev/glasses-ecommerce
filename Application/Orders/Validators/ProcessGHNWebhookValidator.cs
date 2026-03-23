using Application.Orders.Commands;
using FluentValidation;

namespace Application.Orders.Validators;

public sealed class ProcessGHNWebhookValidator : AbstractValidator<ProcessGHNWebhook.Command>
{
    public ProcessGHNWebhookValidator()
    {
        RuleFor(x => x.Payload)
            .NotNull()
            .WithMessage("Webhook payload is required.");

        When(x => x.Payload != null, () =>
        {
            RuleFor(x => x.Payload.ClientOrderCode)
                .NotEmpty()
                .WithMessage("ClientOrderCode is required.")
                .Must(code => Guid.TryParse(code, out _))
                .WithMessage("ClientOrderCode must be a valid GUID.");

            RuleFor(x => x.Payload.Status)
                .NotEmpty()
                .WithMessage("Status is required (e.g., picked, delivered, etc.).");
        });
    }
}

using Application.Inventory.Commands;
using FluentValidation;

namespace Application.Inventory.Validators;

public sealed class RejectInboundValidator : AbstractValidator<RejectInbound.Command>
{
    public RejectInboundValidator()
    {
        RuleFor(x => x.InboundRecordId)
            .NotEmpty().WithMessage("Inbound record ID is required.");

        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.RejectionReason)
                .NotEmpty().WithMessage("Rejection reason is required.")
                .MaximumLength(500).WithMessage("Rejection reason cannot exceed 500 characters.");
        });
    }
}

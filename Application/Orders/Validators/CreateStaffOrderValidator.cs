using Application.Orders.Commands;
using Domain;
using FluentValidation;

namespace Application.Orders.Validators;

public sealed class CreateStaffOrderValidator : AbstractValidator<CreateStaffOrder.Command>
{
    public CreateStaffOrderValidator()
    {
        RuleFor(x => x.Dto.OrderSource)
            .IsInEnum()
            .Must(x => x != OrderSource.Unknown)
            .WithMessage("OrderSource must be Online or Offline.");

        RuleFor(x => x.Dto.OrderType)
            .IsInEnum()
            .Must(x => x != OrderType.Unknown)
            .WithMessage("OrderType must be ReadyStock, PreOrder, or Prescription.");

        RuleFor(x => x.Dto.Items)
            .NotEmpty().WithMessage("Order must have at least one item.");

        RuleForEach(x => x.Dto.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductVariantId)
                .NotEmpty().WithMessage("ProductVariantId is required.");
            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than 0.")
                .LessThanOrEqualTo(999).WithMessage("Quantity cannot exceed 999 items.");
        });

        RuleFor(x => x.Dto.PaymentMethod)
            .IsInEnum()
            .WithMessage("Invalid payment method.");

        // Online orders require address
        RuleFor(x => x.Dto.AddressId)
            .NotEmpty()
            .When(x => x.Dto.OrderSource == OrderSource.Online)
            .WithMessage("Address is required for online orders.");

        // Prescription orders require prescription details
        RuleFor(x => x.Dto.Prescription)
            .NotNull()
            .When(x => x.Dto.OrderType == OrderType.Prescription)
            .WithMessage("Prescription details are required for prescription orders.");

        When(x => x.Dto.Prescription != null, () =>
        {
            RuleFor(x => x.Dto.Prescription!.Details)
                .NotEmpty().WithMessage("Prescription must have at least one eye detail.");

            RuleForEach(x => x.Dto.Prescription!.Details).ChildRules(detail =>
            {
                detail.RuleFor(d => d.Eye)
                    .IsInEnum()
                    .Must(e => e != EyeType.Unknown)
                    .WithMessage("Eye must be Left or Right.");

                detail.RuleFor(d => d.SPH)
                    .InclusiveBetween(-20m, 20m)
                    .When(d => d.SPH.HasValue)
                    .WithMessage("SPH must be between -20 and +20.");

                detail.RuleFor(d => d.CYL)
                    .InclusiveBetween(-6m, 0m)
                    .When(d => d.CYL.HasValue)
                    .WithMessage("CYL must be between -6 and 0.");

                detail.RuleFor(d => d.AXIS)
                    .InclusiveBetween(0, 180)
                    .When(d => d.AXIS.HasValue)
                    .WithMessage("AXIS must be between 0 and 180.");

                detail.RuleFor(d => d.PD)
                    .InclusiveBetween(40m, 80m)
                    .When(d => d.PD.HasValue)
                    .WithMessage("PD must be between 40 and 80.");

                // AXIS requires CYL and vice versa
                detail.RuleFor(d => d.AXIS)
                    .NotNull()
                    .When(d => d.CYL.HasValue)
                    .WithMessage("AXIS is required when CYL is provided.");

                detail.RuleFor(d => d.CYL)
                    .NotNull()
                    .When(d => d.AXIS.HasValue)
                    .WithMessage("CYL is required when AXIS is provided.");
            });
        });

        RuleFor(x => x.Dto.WalkInCustomerName)
            .MaximumLength(100)
            .When(x => x.Dto.WalkInCustomerName != null);

        RuleFor(x => x.Dto.WalkInCustomerPhone)
            .MaximumLength(20)
            .When(x => x.Dto.WalkInCustomerPhone != null);

        RuleFor(x => x.Dto.CustomerNote)
            .MaximumLength(500)
            .When(x => x.Dto.CustomerNote != null);
    }
}

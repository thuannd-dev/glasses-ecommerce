using Application.Orders.Commands;
using Domain;
using FluentValidation;

namespace Application.Orders.Validators;

public sealed class UpdateOrderStatusValidator : AbstractValidator<UpdateOrderStatus.Command>
{
    public UpdateOrderStatusValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Order ID is required.");

        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {

            RuleFor(x => x.Dto.NewStatus)
                .IsInEnum()
                .Must(s => s != OrderStatus.Pending)
                .WithMessage("Cannot set status back to Pending.");

            RuleFor(x => x.Dto.Notes)
                .MaximumLength(500)
                .When(x => x.Dto.Notes != null);

            // Shipment is required when transitioning to Shipped
            When(x => x.Dto.NewStatus == OrderStatus.Shipped, () =>
            {
                RuleFor(x => x.Dto.Shipment)
                    .NotNull().WithMessage("Shipment info is required when shipping an order.");

                When(x => x.Dto.Shipment != null, () =>
                {
                    RuleFor(x => x.Dto.Shipment!.CarrierName)
                        .IsInEnum()
                        .Must(c => c != ShippingCarrier.Unknown)
                        .WithMessage("Valid shipping carrier is required.");

                    RuleFor(x => x.Dto.Shipment!.ShippingNotes)
                        .MaximumLength(500)
                        .When(x => x.Dto.Shipment!.ShippingNotes != null);
                });
            });

        });
    }
}

using Application.Orders.Commands;
using Domain;
using FluentValidation;

namespace Application.Orders.Validators;

public sealed class CheckoutValidator : AbstractValidator<Checkout.Command>
{
    private const string CloudinaryDomain = "res.cloudinary.com";
    private const int MaxUrlLength = 2048;

    public CheckoutValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.SelectedCartItemIds)
                .NotEmpty().WithMessage("You must select at least one item to checkout.")
                .Must(ids => ids != null && ids.All(id => id != Guid.Empty))
                .WithMessage("One or more selected cart item IDs are invalid (empty GUID).")
                .Must(ids => ids != null && ids.Count == ids.Distinct().Count())
                .WithMessage("Duplicate cart item IDs are not allowed.");

            RuleFor(x => x.Dto.AddressId)
                .NotEmpty().WithMessage("Address is required.");

            RuleFor(x => x.Dto.DistrictId)
                .GreaterThan(0).WithMessage("DistrictId is required for shipping fee calculation.");

            RuleFor(x => x.Dto.WardCode)
                .NotEmpty().WithMessage("WardCode is required for shipping fee calculation.");

            RuleFor(x => x.Dto.OrderType)
                .IsInEnum()
                .Must(x => x != OrderType.Unknown)
                .WithMessage("OrderType must be ReadyStock, PreOrder, or Prescription.");

            RuleFor(x => x.Dto.PaymentMethod)
                .IsInEnum()
                .Must(x => x != PaymentMethod.Cash)
                .WithMessage("Cash payment is not available for online orders.");

            RuleFor(x => x.Dto.Prescriptions)
                .NotEmpty()
                .When(x => x.Dto.OrderType == OrderType.Prescription)
                .WithMessage("Prescription details are required for prescription orders.");

            When(x => x.Dto.Prescriptions != null && x.Dto.SelectedCartItemIds != null, () =>
            {
                RuleFor(x => x.Dto.Prescriptions)
                    .Must((root, prescriptions) => prescriptions!.All(p => root.Dto.SelectedCartItemIds.Contains(p.CartItemId)))
                    .WithMessage("Prescription must be linked to a selected cart item.")
                    .Must(prescriptions => prescriptions!.Select(p => p.CartItemId).Distinct().Count() == prescriptions!.Count)
                    .WithMessage("Each selected cart item can only have one prescription.");

                RuleForEach(x => x.Dto.Prescriptions).ChildRules(prescriptionInfo =>
                {
                    prescriptionInfo.RuleFor(p => p.Prescription)
                        .NotNull().WithMessage("Prescription details are required.");

                    prescriptionInfo.RuleFor(p => p.CartItemId)
                        .NotEmpty().WithMessage("CartItemId is required for each prescription.");

                    prescriptionInfo.When(p => p.Prescription != null, () =>
                    {
                        // ImageUrl is optional (user can input prescription manually),
                        // but if provided, must be a valid Cloudinary URL
                        prescriptionInfo.RuleFor(p => p.Prescription.ImageUrl)
                            .MaximumLength(MaxUrlLength)
                            .When(p => !string.IsNullOrWhiteSpace(p.Prescription.ImageUrl))
                            .WithMessage($"ImageUrl must not exceed {MaxUrlLength} characters.")
                            .Must(BeValidHttpUrl)
                            .When(p => !string.IsNullOrWhiteSpace(p.Prescription.ImageUrl))
                            .WithMessage("ImageUrl must be a valid HTTP or HTTPS URL.")
                            .Must(BeFromCloudinary)
                            .When(p => !string.IsNullOrWhiteSpace(p.Prescription.ImageUrl))
                            .WithMessage($"ImageUrl must be from {CloudinaryDomain} domain.");

                        prescriptionInfo.RuleFor(p => p.Prescription.Details)
                            .NotEmpty().WithMessage("Each prescription must have at least one eye detail.");

                        prescriptionInfo.RuleForEach(p => p.Prescription!.Details).ChildRules(detail =>
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
                                .InclusiveBetween(-6m, 6m)
                                .When(d => d.CYL.HasValue)
                                .WithMessage("CYL must be between -6 and +6.");

                            detail.RuleFor(d => d.AXIS)
                                .InclusiveBetween(0, 180)
                                .When(d => d.AXIS.HasValue)
                                .WithMessage("AXIS must be between 0 and 180.");

                            detail.RuleFor(d => d.PD)
                                .InclusiveBetween(40m, 80m)
                                .When(d => d.PD.HasValue)
                                .WithMessage("PD must be between 40 and 80.");

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
                });
            });

            RuleFor(x => x.Dto.CustomerNote)
                .MaximumLength(500)
                .When(x => x.Dto.CustomerNote != null);

        }); // end When Dto != null
    }

    private static bool BeValidHttpUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out Uri? uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }

    private static bool BeFromCloudinary(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return true;

        if (!Uri.TryCreate(url, UriKind.Absolute, out Uri? uri))
            return false;

        return uri.Host.Equals(CloudinaryDomain, StringComparison.OrdinalIgnoreCase)
            || uri.Host.EndsWith($".{CloudinaryDomain}", StringComparison.OrdinalIgnoreCase);
    }
}

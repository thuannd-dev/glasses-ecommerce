using Application.Prescriptions.Commands;
using FluentValidation;

namespace Application.Prescriptions.Validators;

public sealed class AnalyzePrescriptionFromUrlValidator : AbstractValidator<AnalyzePrescriptionFromUrl.Command>
{
    public AnalyzePrescriptionFromUrlValidator()
    {
        RuleFor(x => x.ImageUrl)
            .NotEmpty().WithMessage("Image URL is required.")
            .Must(BeValidAbsoluteUrl)
            .WithMessage("Invalid image URL format.");

        RuleFor(x => x.PublicId)
            .NotEmpty().WithMessage("PublicId is required.");
    }

    private static bool BeValidAbsoluteUrl(string imageUrl)
    {
        UriKind kind = UriKind.Absolute;
        bool isValid = Uri.TryCreate(imageUrl, kind, out Uri? uri);
        return isValid && uri != null;
    }
}

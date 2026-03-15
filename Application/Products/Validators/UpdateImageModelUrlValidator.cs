using Application.Products.Commands;
using FluentValidation;

namespace Application.Products.Validators;

public sealed class UpdateImageModelUrlValidator : AbstractValidator<UpdateImageModelUrl.Command>
{
    public UpdateImageModelUrlValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null && !string.IsNullOrWhiteSpace(x.Dto.ModelUrl), () =>
        {
            RuleFor(x => x.Dto.ModelUrl)
                .MaximumLength(500).WithMessage("ModelUrl must not exceed 500 characters.")
                .Must(BeAValidUrl).WithMessage("ModelUrl must be a valid HTTP or HTTPS URL.");
        });
    }

    private bool BeAValidUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return true; // Handled by When()

        return Uri.TryCreate(url, UriKind.Absolute, out Uri? outUri)
               && (outUri.Scheme == Uri.UriSchemeHttp || outUri.Scheme == Uri.UriSchemeHttps);
    }
}

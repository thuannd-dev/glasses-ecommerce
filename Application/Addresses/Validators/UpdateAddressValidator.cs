using Application.Addresses.Commands;
using Application.Addresses.DTOs;
using FluentValidation;

namespace Application.Addresses.Validators;

public sealed class UpdateAddressValidator : AbstractValidator<UpdateAddress.Command>
{
    public UpdateAddressValidator()
    {
        RuleFor(x => x.UpdateAddressDto.RecipientName)
            .NotEmpty()
            .WithMessage("Recipient name is required.")
            .MaximumLength(100)
            .WithMessage("Recipient name cannot exceed 100 characters.");

        RuleFor(x => x.UpdateAddressDto.RecipientPhone)
            .NotEmpty()
            .WithMessage("Recipient phone is required.")
            .MaximumLength(20)
            .WithMessage("Recipient phone cannot exceed 20 characters.")
            .Matches(@"^[0-9+\-\s()]+$")
            .WithMessage("Recipient phone must be a valid phone number.");

        RuleFor(x => x.UpdateAddressDto.Venue)
            .NotEmpty()
            .WithMessage("Venue is required.")
            .MaximumLength(200)
            .WithMessage("Venue cannot exceed 200 characters.");

        RuleFor(x => x.UpdateAddressDto.Ward)
            .NotEmpty()
            .WithMessage("Ward is required.")
            .MaximumLength(100)
            .WithMessage("Ward cannot exceed 100 characters.");

        RuleFor(x => x.UpdateAddressDto.District)
            .NotEmpty()
            .WithMessage("District is required.")
            .MaximumLength(100)
            .WithMessage("District cannot exceed 100 characters.");

        RuleFor(x => x.UpdateAddressDto.City)
            .NotEmpty()
            .WithMessage("City is required.")
            .MaximumLength(100)
            .WithMessage("City cannot exceed 100 characters.");

        RuleFor(x => x.UpdateAddressDto.PostalCode)
            .MaximumLength(20)
            .WithMessage("Postal code cannot exceed 20 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdateAddressDto.PostalCode));

        RuleFor(x => x.UpdateAddressDto.Latitude)
            .InclusiveBetween(-90, 90)
            .WithMessage("Latitude must be between -90 and 90.")
            .When(x => x.UpdateAddressDto.Latitude.HasValue);

        RuleFor(x => x.UpdateAddressDto.Longitude)
            .InclusiveBetween(-180, 180)
            .WithMessage("Longitude must be between -180 and 180.")
            .When(x => x.UpdateAddressDto.Longitude.HasValue);
    }
}

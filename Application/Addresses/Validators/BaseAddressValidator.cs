using System;
using Application.Addresses.DTOs;
using FluentValidation;

namespace Application.Addresses.Validators;

public class BaseAddressValidator<T, TDto> : AbstractValidator<T> where TDto : BaseAddressDto
{
    public BaseAddressValidator(Func<T, TDto> selector)
    {
        RuleFor(x => selector(x).RecipientName)
            .NotEmpty()
            .WithMessage("Recipient name is required.")
            .MaximumLength(100)
            .WithMessage("Recipient name cannot exceed 100 characters.");

        RuleFor(x => selector(x).RecipientPhone)
            .NotEmpty()
            .WithMessage("Recipient phone is required.")
            .MaximumLength(20)
            .WithMessage("Recipient phone cannot exceed 20 characters.")
            .Matches(@"^[0-9+\-\s()]+$")
            .WithMessage("Recipient phone must be a valid phone number.");

        RuleFor(x => selector(x).Venue)
            .NotEmpty()
            .WithMessage("Venue is required.")
            .MaximumLength(200)
            .WithMessage("Venue cannot exceed 200 characters.");

        RuleFor(x => selector(x).Ward)
            .NotEmpty()
            .WithMessage("Ward is required.")
            .MaximumLength(100)
            .WithMessage("Ward cannot exceed 100 characters.");

        RuleFor(x => selector(x).District)
            .NotEmpty()
            .WithMessage("District is required.")
            .MaximumLength(100)
            .WithMessage("District cannot exceed 100 characters.");

        RuleFor(x => selector(x).City)
            .NotEmpty()
            .WithMessage("City is required.")
            .MaximumLength(100)
            .WithMessage("City cannot exceed 100 characters.");

        RuleFor(x => selector(x).PostalCode)
            .MaximumLength(20)
            .WithMessage("Postal code cannot exceed 20 characters.")
            .When(x => !string.IsNullOrEmpty(selector(x).PostalCode));

        RuleFor(x => selector(x).Latitude)
            .InclusiveBetween(-90, 90)
            .WithMessage("Latitude must be between -90 and 90.")
            .When(x => selector(x).Latitude.HasValue);

        RuleFor(x => selector(x).Longitude)
            .InclusiveBetween(-180, 180)
            .WithMessage("Longitude must be between -180 and 180.")
            .When(x => selector(x).Longitude.HasValue);
    }
}

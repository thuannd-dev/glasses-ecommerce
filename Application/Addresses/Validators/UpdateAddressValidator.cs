using Application.Addresses.Commands;
using Application.Addresses.DTOs;
using FluentValidation;

namespace Application.Addresses.Validators;

public sealed class UpdateAddressValidator
    : BaseAddressValidator<UpdateAddress.Command, UpdateAddressDto>
{
    public UpdateAddressValidator() : base(x => x.UpdateAddressDto)
    {
        RuleLevelCascadeMode = CascadeMode.Stop;

        RuleFor(x => x.UpdateAddressDto)
            .NotNull()
            .WithMessage("Request body is required.");
    }
}

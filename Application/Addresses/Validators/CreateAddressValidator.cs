using Application.Addresses.Commands;
using Application.Addresses.DTOs;
using FluentValidation;

namespace Application.Addresses.Validators;

public sealed class CreateAddressValidator
    : BaseAddressValidator<CreateAddress.Command, CreateAddressDto>
{
    public CreateAddressValidator() : base(x => x.CreateAddressDto) { }
}

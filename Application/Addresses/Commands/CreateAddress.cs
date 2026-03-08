using Application.Addresses.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Addresses.Commands;

public sealed class CreateAddress
{
    public sealed class Command : IRequest<Result<AddressDto>>
    {
        public required CreateAddressDto CreateAddressDto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<AddressDto>>
    {
        public async Task<Result<AddressDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            // If setting as default, unmark all other user addresses
            if (request.CreateAddressDto.IsDefault)
            {
                List<Address> existingAddresses = await context.Addresses
                    .Where(a => a.UserId == userId && a.IsDefault && !a.IsDeleted)
                    .ToListAsync(cancellationToken);

                foreach (Address addr in existingAddresses)
                {
                    addr.IsDefault = false;
                }
            }

            // Create new address
            Address address = mapper.Map<Address>(request.CreateAddressDto);
            address.UserId = userId;

            context.Addresses.Add(address);

            bool success = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!success)
            {
                return Result<AddressDto>.Failure("Failed to create address.", 500);
            }

            // Retrieve the created address with projection
            AddressDto? addressDto = await context.Addresses
                .Where(a => a.Id == address.Id)
                .ProjectTo<AddressDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (addressDto == null)
            {
                return Result<AddressDto>.Failure("Failed to retrieve created address.", 500);
            }

            return Result<AddressDto>.Success(addressDto);
        }
    }
}

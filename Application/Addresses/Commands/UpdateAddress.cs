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

public sealed class UpdateAddress
{
    public sealed class Command : IRequest<Result<AddressDto>>
    {
        public required Guid AddressId { get; set; }
        public required UpdateAddressDto UpdateAddressDto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<AddressDto>>
    {
        public async Task<Result<AddressDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            // Find address and verify ownership
            Address? address = await context.Addresses
                .FirstOrDefaultAsync(a => a.Id == request.AddressId
                    && a.UserId == userId
                    && !a.IsDeleted, cancellationToken);

            if (address == null)
            {
                return Result<AddressDto>.Failure("Address not found.", 404);
            }

            // If setting as default, unmark all other user addresses
            if (request.UpdateAddressDto.IsDefault && !address.IsDefault)
            {
                List<Address> otherAddresses = await context.Addresses
                    .Where(a => a.UserId == userId
                        && a.Id != request.AddressId
                        && a.IsDefault
                        && !a.IsDeleted)
                    .ToListAsync(cancellationToken);

                foreach (Address addr in otherAddresses)
                {
                    addr.IsDefault = false;
                }
            }

            // Update address properties
            mapper.Map(request.UpdateAddressDto, address);

            bool success = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!success)
            {
                return Result<AddressDto>.Failure("Failed to update address.", 500);
            }

            // Retrieve updated address with projection
            AddressDto? addressDto = await context.Addresses
                .Where(a => a.Id == address.Id)
                .ProjectTo<AddressDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (addressDto == null)
            {
                return Result<AddressDto>.Failure("Failed to retrieve updated address.", 500);
            }

            return Result<AddressDto>.Success(addressDto);
        }
    }
}

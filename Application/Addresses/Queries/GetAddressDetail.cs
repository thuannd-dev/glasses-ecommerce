using Application.Addresses.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Addresses.Queries;

public sealed class GetAddressDetail
{
    public sealed class Query : IRequest<Result<AddressDto>>
    {
        public required Guid AddressId { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Query, Result<AddressDto>>
    {
        public async Task<Result<AddressDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            AddressDto? address = await context.Addresses
                .AsNoTracking()
                .Where(a => a.Id == request.AddressId
                    && a.UserId == userId
                    && !a.IsDeleted)
                .ProjectTo<AddressDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (address == null)
            {
                return Result<AddressDto>.Failure("Address not found.", 404);
            }

            return Result<AddressDto>.Success(address);
        }
    }
}

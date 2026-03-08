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

public sealed class GetDefaultAddress
{
    public sealed class Query : IRequest<Result<AddressDto>>
    {
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Query, Result<AddressDto>>
    {
        public async Task<Result<AddressDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            AddressDto? defaultAddress = await context.Addresses
                .AsNoTracking()
                .Where(a => a.UserId == userId
                    && a.IsDefault
                    && !a.IsDeleted)
                .ProjectTo<AddressDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (defaultAddress == null)
            {
                return Result<AddressDto>.Failure("No default address found.", 404);
            }

            return Result<AddressDto>.Success(defaultAddress);
        }
    }
}

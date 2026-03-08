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

public sealed class GetAddresses
{
    public sealed class Query : IRequest<Result<List<AddressDto>>>
    {
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Query, Result<List<AddressDto>>>
    {
        public async Task<Result<List<AddressDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            List<AddressDto> addresses = await context.Addresses
                .AsNoTracking()
                .Where(a => a.UserId == userId && !a.IsDeleted)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.Id)
                .ProjectTo<AddressDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<AddressDto>>.Success(addresses);
        }
    }
}

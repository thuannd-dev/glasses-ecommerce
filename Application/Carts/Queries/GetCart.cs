using Application.Carts.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Carts.Queries;

public sealed class GetCart
{
    public sealed class Query : IRequest<Result<CartDto>>;

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Query, Result<CartDto>>
    {
        public async Task<Result<CartDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            CartDto? cartDto = await context.Carts
                .Where(c => c.UserId == userId && c.Status == CartStatus.Active)
                .AsSplitQuery()
                .ProjectTo<CartDto>(mapper.ConfigurationProvider)
                .AsNoTracking()
                .FirstOrDefaultAsync(cancellationToken);

            if (cartDto == null)
            {
                // Return empty cart if not found
                return Result<CartDto>.Success(new CartDto
                {
                    Id = Guid.Empty,
                    UserId = userId,
                    Status = CartStatus.Active.ToString(),
                    CreatedAt = DateTime.UtcNow,
                    Items = [],
                    TotalItems = 0,
                    TotalPrice = 0
                });
            }

            return Result<CartDto>.Success(cartDto);
        }
    }
}

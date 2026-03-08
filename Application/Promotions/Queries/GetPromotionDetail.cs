using Application.Core;
using Application.Promotions.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Promotions.Queries;

public sealed class GetPromotionDetail
{
    public sealed class Query : IRequest<Result<PromotionDetailDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Query, Result<PromotionDetailDto>>
    {
        public async Task<Result<PromotionDetailDto>> Handle(Query request, CancellationToken ct)
        {
            PromotionDetailDto? dto = await context.Promotions
                .AsNoTracking()
                .Where(p => p.Id == request.Id)
                .ProjectTo<PromotionDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<PromotionDetailDto>.Failure("Promotion not found.", 404);

            return Result<PromotionDetailDto>.Success(dto);
        }
    }
}

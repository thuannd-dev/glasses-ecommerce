using Application.Core;
using Application.Promotions.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Promotions.Queries;

public sealed class GetPromotions
{
    public sealed class Query : IRequest<Result<PagedResult<PromotionListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public bool? IsActive { get; set; }
        public int? PromotionType { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Query, Result<PagedResult<PromotionListDto>>>
    {
        public async Task<Result<PagedResult<PromotionListDto>>> Handle(Query request, CancellationToken ct)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<PromotionListDto>>.Failure("Invalid pagination parameters.", 400);

            IQueryable<Promotion> query = context.Promotions.AsNoTracking();

            if (request.IsActive.HasValue)
                query = query.Where(p => p.IsActive == request.IsActive.Value);

            if (request.PromotionType.HasValue &&
                !Enum.IsDefined(typeof(PromotionType), request.PromotionType.Value))
            {
                return Result<PagedResult<PromotionListDto>>.Failure("Invalid promotion type.", 400);
            }

            if (request.PromotionType.HasValue)
            {
                PromotionType promotionType = (PromotionType)request.PromotionType.Value;
                query = query.Where(p => p.PromotionType == promotionType);
            }

            if (request.ValidFrom.HasValue)
                query = query.Where(p => p.ValidTo >= request.ValidFrom.Value);

            if (request.ValidTo.HasValue)
                query = query.Where(p => p.ValidFrom <= request.ValidTo.Value);

            int totalCount = await query.CountAsync(ct);

            List<PromotionListDto> items = await query
                .OrderByDescending(p => p.ValidFrom)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<PromotionListDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result<PagedResult<PromotionListDto>>.Success(new PagedResult<PromotionListDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
            });
        }
    }
}

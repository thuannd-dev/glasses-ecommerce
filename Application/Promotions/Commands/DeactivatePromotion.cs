using Application.Core;
using Application.Promotions.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Promotions.Commands;

public sealed class DeactivatePromotion
{
    public sealed class Command : IRequest<Result<PromotionDetailDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Command, Result<PromotionDetailDto>>
    {
        public async Task<Result<PromotionDetailDto>> Handle(Command request, CancellationToken ct)
        {
            Promotion? promotion = await context.Promotions
                .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

            if (promotion == null)
                return Result<PromotionDetailDto>.Failure("Promotion not found.", 404);

            // Idempotent: already deactivated is still OK
            promotion.IsActive = false;

            await context.SaveChangesAsync(ct);

            PromotionDetailDto result = await context.Promotions
                .AsNoTracking()
                .Where(p => p.Id == promotion.Id)
                .ProjectTo<PromotionDetailDto>(mapper.ConfigurationProvider)
                .FirstAsync(ct);

            return Result<PromotionDetailDto>.Success(result);
        }
    }
}

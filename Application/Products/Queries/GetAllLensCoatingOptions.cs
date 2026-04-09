using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Queries;

/// <summary>
/// Manager-only: trả về TẤT CẢ coating options (cả inactive) cho một Lens Product.
/// Customer-facing dùng GetLensCoatingOptions (chỉ active).
/// </summary>
public sealed class GetAllLensCoatingOptions
{
    public sealed class Query : IRequest<Result<List<LensCoatingOptionDto>>>
    {
        public required Guid LensProductId { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<List<LensCoatingOptionDto>>>
    {
        public async Task<Result<List<LensCoatingOptionDto>>> Handle(Query request, CancellationToken ct)
        {
            bool lensExists = await context.Products
                .AsNoTracking()
                .AnyAsync(p => p.Id == request.LensProductId && p.Type == ProductType.Lens, ct);

            if (!lensExists)
                return Result<List<LensCoatingOptionDto>>.Failure("Lens product not found.", 404);

            List<LensCoatingOptionDto> coatings = await context.LensCoatingOptions
                .AsNoTracking()
                .Where(c => c.LensProductId == request.LensProductId) // no IsActive filter
                .OrderBy(c => c.IsActive ? 0 : 1)   // active first
                .ThenBy(c => c.ExtraPrice)
                .Select(c => new LensCoatingOptionDto
                {
                    Id            = c.Id,
                    LensProductId = c.LensProductId,
                    CoatingName   = c.CoatingName,
                    Description   = c.Description,
                    ExtraPrice    = c.ExtraPrice,
                    IsActive      = c.IsActive,
                })
                .ToListAsync(ct);

            return Result<List<LensCoatingOptionDto>>.Success(coatings);
        }
    }
}

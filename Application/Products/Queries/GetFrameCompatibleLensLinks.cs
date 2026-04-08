using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Queries;

public sealed class GetFrameCompatibleLensLinks
{
    public sealed class Query : IRequest<Result<List<CompatibleLensLinkDto>>>
    {
        public required Guid FrameProductId { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<List<CompatibleLensLinkDto>>>
    {
        public async Task<Result<List<CompatibleLensLinkDto>>> Handle(Query request, CancellationToken ct)
        {
            // Validate frame exists
            bool frameExists = await context.Products
                .AsNoTracking()
                .AnyAsync(p => p.Id == request.FrameProductId && p.Type == ProductType.Frame, ct);

            if (!frameExists)
                return Result<List<CompatibleLensLinkDto>>.Failure("Frame product not found.", 404);

            List<CompatibleLensLinkDto> links = await context.FrameLensCompatibilities
                .AsNoTracking()
                .Where(flc => flc.FrameProductId == request.FrameProductId)
                .Select(flc => new CompatibleLensLinkDto
                {
                    LensProductId   = flc.LensProductId,
                    LensProductName = flc.LensProduct.ProductName,
                    Brand           = flc.LensProduct.Brand,
                    Status          = flc.LensProduct.Status,
                })
                .ToListAsync(ct);

            return Result<List<CompatibleLensLinkDto>>.Success(links);
        }
    }
}

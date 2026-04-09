using Application.Core;
using Application.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Queries;

public sealed class GetLensVariantAttribute
{
    public sealed class Query : IRequest<Result<LensVariantAttributeDto>>
    {
        public required Guid ProductId   { get; set; }
        public required Guid VariantId   { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<LensVariantAttributeDto>>
    {
        public async Task<Result<LensVariantAttributeDto>> Handle(Query request, CancellationToken ct)
        {
            LensVariantAttributeDto? dto = await context.LensVariantAttributes
                .AsNoTracking()
                .Where(a => a.ProductVariantId == request.VariantId
                         && a.Variant.ProductId == request.ProductId)
                .Select(a => new LensVariantAttributeDto
                {
                    ProductVariantId = a.ProductVariantId,
                    SphMin     = a.SphMin,
                    SphMax     = a.SphMax,
                    CylMin     = a.CylMin,
                    CylMax     = a.CylMax,
                    AxisMin    = a.AxisMin,
                    AxisMax    = a.AxisMax,
                    AddMin     = a.AddMin,
                    AddMax     = a.AddMax,
                    Index      = a.Index,
                    LensDesign = a.LensDesign,
                })
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<LensVariantAttributeDto>.Failure(
                    "Lens attributes not found for the specified variant.", 404);

            return Result<LensVariantAttributeDto>.Success(dto);
        }
    }
}

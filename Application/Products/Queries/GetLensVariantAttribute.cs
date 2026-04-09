using Application.Core;
using Application.Products.DTOs;
using Domain;
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
            // Mirror SetLensVariantAttribute validation: load variant + Product first
            // so each failure case can return a distinct, meaningful status code.
            ProductVariant? variant = await context.ProductVariants
                .AsNoTracking()
                .Include(pv => pv.Product)
                .Include(pv => pv.LensVariantAttribute)
                .FirstOrDefaultAsync(pv => pv.Id == request.VariantId, ct);

            if (variant == null)
                return Result<LensVariantAttributeDto>.Failure("Variant not found.", 404);

            if (variant.ProductId != request.ProductId)
                return Result<LensVariantAttributeDto>.Failure(
                    "The specified variant does not belong to the provided product.", 400);

            if (variant.Product.Type != ProductType.Lens)
                return Result<LensVariantAttributeDto>.Failure(
                    "Lens attributes can only be retrieved for variants of Lens products.", 400);

            if (variant.LensVariantAttribute == null)
                return Result<LensVariantAttributeDto>.Failure(
                    "Lens attributes have not been set for this variant.", 404);

            LensVariantAttribute a = variant.LensVariantAttribute;
            return Result<LensVariantAttributeDto>.Success(new LensVariantAttributeDto
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
            });
        }
    }
}

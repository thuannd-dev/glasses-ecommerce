using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Queries;

public sealed class GetCompatibleLenses
{
    public sealed class Query : IRequest<Result<List<CompatibleLensDto>>>
    {
        public required Guid FrameProductId { get; set; }

        // ── Optional prescription filter (per eye) ──────────────
        // Nếu cung cấp → chỉ trả về variants mà range bao phủ được cả OD và OS.
        // OD = mắt phải | OS = mắt trái
        public decimal? SphOD { get; set; }
        public decimal? CylOD { get; set; }
        public decimal? SphOS { get; set; }
        public decimal? CylOS { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<List<CompatibleLensDto>>>
    {
        public async Task<Result<List<CompatibleLensDto>>> Handle(Query request, CancellationToken ct)
        {
            // Validate frame product exists
            bool frameExists = await context.Products
                .AsNoTracking()
                .AnyAsync(p => p.Id == request.FrameProductId && p.Type == ProductType.Frame, ct);

            if (!frameExists)
                return Result<List<CompatibleLensDto>>.Failure("Frame product not found.", 404);

            bool hasRx = request.SphOD.HasValue || request.SphOS.HasValue
                      || request.CylOD.HasValue || request.CylOS.HasValue;

            // Tính boundary để filter variant range một lần (tránh tính lại nhiều lần trong LINQ)
            // Lens variant range phải bao phủ cả 2 mắt đồng thời:
            //   SphMin <= min(sphOD, sphOS)  AND  SphMax >= max(sphOD, sphOS)
            //   CylMin <= min(cylOD, cylOS)  AND  CylMax >= max(cylOD, cylOS)
            decimal? rxSphLow  = Min(request.SphOD, request.SphOS);
            decimal? rxSphHigh = Max(request.SphOD, request.SphOS);
            decimal? rxCylLow  = Min(request.CylOD, request.CylOS);
            decimal? rxCylHigh = Max(request.CylOD, request.CylOS);

            // Load compatible lens products với variants + attributues + coatings
            List<CompatibleLensDto> result = await context.FrameLensCompatibilities
                .AsNoTracking()
                .Where(flc => flc.FrameProductId == request.FrameProductId
                           && flc.LensProduct.Status == ProductStatus.Active)
                .Select(flc => new CompatibleLensDto
                {
                    LensProductId   = flc.LensProductId,
                    LensProductName = flc.LensProduct.ProductName,
                    Brand           = flc.LensProduct.Brand,

                    Variants = flc.LensProduct.Variants
                        .Where(pv => pv.IsActive
                            && pv.LensVariantAttribute != null
                            // Prescription range filter (only apply when RX values provided)
                            && (!hasRx
                                || (
                                    // SPH — variant range must cover both eyes' values
                                    (!rxSphLow.HasValue  || pv.LensVariantAttribute!.SphMin <= rxSphLow.Value)
                                 && (!rxSphHigh.HasValue || pv.LensVariantAttribute!.SphMax >= rxSphHigh.Value)
                                    // CYL — variant range must cover both eyes' values (all ≤ 0)
                                 && (!rxCylLow.HasValue  || pv.LensVariantAttribute!.CylMin <= rxCylLow.Value)
                                 && (!rxCylHigh.HasValue || pv.LensVariantAttribute!.CylMax >= rxCylHigh.Value)
                               ))
                        )
                        .Select(pv => new CompatibleLensVariantDto
                        {
                            VariantId     = pv.Id,
                            VariantName   = pv.VariantName,
                            Price         = pv.Price,
                            IsActive      = pv.IsActive,
                            IsPreOrder    = pv.IsPreOrder,
                            StockAvailable = pv.IsPreOrder
                                ? null
                                : (int?)pv.Stock!.QuantityAvailable,

                            SphMin     = pv.LensVariantAttribute!.SphMin,
                            SphMax     = pv.LensVariantAttribute!.SphMax,
                            CylMin     = pv.LensVariantAttribute!.CylMin,
                            CylMax     = pv.LensVariantAttribute!.CylMax,
                            AxisMin    = pv.LensVariantAttribute!.AxisMin,
                            AxisMax    = pv.LensVariantAttribute!.AxisMax,
                            AddMin     = pv.LensVariantAttribute!.AddMin,
                            AddMax     = pv.LensVariantAttribute!.AddMax,
                            Index      = pv.LensVariantAttribute!.Index,
                            LensDesign = pv.LensVariantAttribute!.LensDesign,
                        })
                        .OrderBy(v => v.Index)
                        .ThenBy(v => v.Price)
                        .ToList(),

                    CoatingOptions = flc.LensProduct.CoatingOptions
                        .Where(c => c.IsActive)
                        .Select(c => new LensCoatingOptionDto
                        {
                            Id            = c.Id,
                            LensProductId = c.LensProductId,
                            CoatingName   = c.CoatingName,
                            Description   = c.Description,
                            ExtraPrice    = c.ExtraPrice,
                            IsActive      = c.IsActive,
                        })
                        .OrderBy(c => c.ExtraPrice)
                        .ToList(),
                })
                .OrderBy(l => l.LensProductName)
                .ToListAsync(ct);

            return Result<List<CompatibleLensDto>>.Success(result);
        }

        // ── Helpers: nullable decimal min/max ────────────────────
        private static decimal? Min(decimal? a, decimal? b) =>
            (a.HasValue && b.HasValue) ? Math.Min(a.Value, b.Value)
            : a ?? b;

        private static decimal? Max(decimal? a, decimal? b) =>
            (a.HasValue && b.HasValue) ? Math.Max(a.Value, b.Value)
            : a ?? b;
    }
}

using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;
/// <summary>
/// Command để insert/update thông số quang học cho một Lens ProductVariant
/// </summary>
public sealed class SetLensVariantAttribute
{
    public sealed class Command : IRequest<Result<LensVariantAttributeDto>>
    {
        public required Guid VariantId { get; set; }
        public required UpsertLensVariantAttributeDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context) : IRequestHandler<Command, Result<LensVariantAttributeDto>>
    {
        public async Task<Result<LensVariantAttributeDto>> Handle(Command request, CancellationToken ct)
        {
            UpsertLensVariantAttributeDto dto = request.Dto;

            // Validate: variant tồn tại và thuộc Lens product
            ProductVariant? variant = await context.ProductVariants
                .Include(pv => pv.Product)
                .Include(pv => pv.LensVariantAttribute)
                .FirstOrDefaultAsync(pv => pv.Id == request.VariantId, ct);

            if (variant == null)
                return Result<LensVariantAttributeDto>.Failure("Variant not found.", 404);

            if (variant.Product.Type != ProductType.Lens)
                return Result<LensVariantAttributeDto>.Failure(
                    "Lens attributes can only be set on variants of Lens products.", 400);

            // Upsert
            if (variant.LensVariantAttribute == null)
            {
                // Insert
                LensVariantAttribute attr = new LensVariantAttribute
                {
                    ProductVariantId = variant.Id,
                    SphMin = dto.SphMin,
                    SphMax = dto.SphMax,
                    CylMin = dto.CylMin,
                    CylMax = dto.CylMax,
                    AxisMin = dto.AxisMin,
                    AxisMax = dto.AxisMax,
                    AddMin = dto.AddMin,
                    AddMax = dto.AddMax,
                    Index = dto.Index,
                    LensDesign = dto.LensDesign,
                };
                context.LensVariantAttributes.Add(attr);
            }
            else
            {
                // Update in-place
                LensVariantAttribute attr = variant.LensVariantAttribute;
                attr.SphMin = dto.SphMin;
                attr.SphMax = dto.SphMax;
                attr.CylMin = dto.CylMin;
                attr.CylMax = dto.CylMax;
                attr.AxisMin = dto.AxisMin;
                attr.AxisMax = dto.AxisMax;
                attr.AddMin = dto.AddMin;
                attr.AddMax = dto.AddMax;
                attr.Index = dto.Index;
                attr.LensDesign = dto.LensDesign;
            }

            bool success = await context.SaveChangesAsync(ct) > 0;
            if (!success)
                return Result<LensVariantAttributeDto>.Failure("Failed to save lens attributes.", 500);

            LensVariantAttribute saved = variant.LensVariantAttribute!;
            LensVariantAttributeDto responseDto = new LensVariantAttributeDto
            {
                ProductVariantId = saved.ProductVariantId,
                SphMin = saved.SphMin,
                SphMax = saved.SphMax,
                CylMin = saved.CylMin,
                CylMax = saved.CylMax,
                AxisMin = saved.AxisMin,
                AxisMax = saved.AxisMax,
                AddMin = saved.AddMin,
                AddMax = saved.AddMax,
                Index = saved.Index,
                LensDesign = saved.LensDesign,
            };

            return Result<LensVariantAttributeDto>.Success(responseDto);
        }
    }
}

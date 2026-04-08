using System.Text.Json;
using Application.Carts.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Carts.Commands;

public sealed class AddItemToCart
{
    public sealed class Command : IRequest<Result<CartItemDto>>
    {
        public required AddCartItemDto AddCartItemDto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<CartItemDto>>
    {
        public async Task<Result<CartItemDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();
            AddCartItemDto dto = request.AddCartItemDto;

            // ── 1. Validate frame variant ────────────────────────────────
            ProductVariant? frameVariant = await context.ProductVariants
                .AsNoTracking()
                .Include(pv => pv.Product)
                .Include(pv => pv.Stock)
                .FirstOrDefaultAsync(pv => pv.Id == dto.ProductVariantId, cancellationToken);

            if (frameVariant == null)
                return Result<CartItemDto>.Failure("Product variant not found.", 404);

            if (frameVariant.Product.Type != ProductType.Frame)
                return Result<CartItemDto>.Failure("The base product variant must be a frame.", 400);

            if (!frameVariant.IsActive)
                return Result<CartItemDto>.Failure("Product variant is not available.", 400);

            if (!frameVariant.IsPreOrder)
            {
                if (frameVariant.Stock == null || frameVariant.Stock.QuantityAvailable < dto.Quantity)
                    return Result<CartItemDto>.Failure(
                        $"Insufficient stock. Only {frameVariant.Stock?.QuantityAvailable ?? 0} items available.", 400);
            }


            decimal coatingExtraPrice = 0;
            string? coatingIdsJson = null;

            if (dto.LensVariantId.HasValue)
            {
                ProductVariant? lensVariant = await context.ProductVariants
                    .AsNoTracking()
                    .Include(pv => pv.Product)
                    .Include(pv => pv.Stock)
                    .Include(pv => pv.LensVariantAttribute)
                    .FirstOrDefaultAsync(pv => pv.Id == dto.LensVariantId.Value, cancellationToken);

                if (lensVariant == null)
                    return Result<CartItemDto>.Failure("Lens variant not found.", 404);

                if (!lensVariant.IsActive)
                    return Result<CartItemDto>.Failure("Selected lens variant is not available.", 400);

                if (lensVariant.Product.Type != ProductType.Lens)
                    return Result<CartItemDto>.Failure("Selected variant is not a lens product.", 400);

                // Validate frame ↔ lens compatibility
                bool isCompatible = await context.FrameLensCompatibilities
                    .AnyAsync(flc => flc.FrameProductId == frameVariant.ProductId
                                  && flc.LensProductId == lensVariant.ProductId, cancellationToken);

                if (!isCompatible)
                    return Result<CartItemDto>.Failure(
                        "Selected lens is not compatible with this frame.", 400);

                if (lensVariant.LensVariantAttribute == null)
                    return Result<CartItemDto>.Failure(
                        "Selected lens variant has no optical specs configured yet.", 400);

                // Lens stock check
                if (!lensVariant.IsPreOrder)
                {
                    if (lensVariant.Stock == null || lensVariant.Stock.QuantityAvailable < dto.Quantity)
                        return Result<CartItemDto>.Failure(
                            $"Insufficient lens stock. Only {lensVariant.Stock?.QuantityAvailable ?? 0} available.", 400);
                }

                // Prescription range validation (if RX provided)
                LensVariantAttribute attr = lensVariant.LensVariantAttribute;

                if (dto.SphOD.HasValue || dto.SphOS.HasValue)
                {
                    if (dto.SphOD.HasValue && (dto.SphOD.Value < attr.SphMin || dto.SphOD.Value > attr.SphMax))
                        return Result<CartItemDto>.Failure(
                            $"Right eye SPH ({dto.SphOD.Value:+0.00;-0.00}) is outside this lens range ({attr.SphMin:+0.00;-0.00} to {attr.SphMax:+0.00;-0.00}).", 400);

                    if (dto.SphOS.HasValue && (dto.SphOS.Value < attr.SphMin || dto.SphOS.Value > attr.SphMax))
                        return Result<CartItemDto>.Failure(
                            $"Left eye SPH ({dto.SphOS.Value:+0.00;-0.00}) is outside this lens range ({attr.SphMin:+0.00;-0.00} to {attr.SphMax:+0.00;-0.00}).", 400);
                }

                if (dto.CylOD.HasValue || dto.CylOS.HasValue)
                {
                    if (dto.CylOD.HasValue && (dto.CylOD.Value < attr.CylMin || dto.CylOD.Value > attr.CylMax))
                        return Result<CartItemDto>.Failure(
                            $"Right eye CYL ({dto.CylOD.Value:0.00}) is outside this lens range ({attr.CylMin:0.00} to {attr.CylMax:0.00}).", 400);

                    if (dto.CylOS.HasValue && (dto.CylOS.Value < attr.CylMin || dto.CylOS.Value > attr.CylMax))
                        return Result<CartItemDto>.Failure(
                            $"Left eye CYL ({dto.CylOS.Value:0.00}) is outside this lens range ({attr.CylMin:0.00} to {attr.CylMax:0.00}).", 400);
                }

                // ── AXIS validation (DB-dependent rules only) ─────────────
                // Rule 1: Lens is spherical-only (CylMin == 0 && CylMax == 0) → reject any AXIS input
                bool isSphericalOnly = attr.CylMin == 0 && attr.CylMax == 0;
                if (isSphericalOnly && (dto.AxisOD.HasValue || dto.AxisOS.HasValue))
                    return Result<CartItemDto>.Failure(
                        "This lens does not support astigmatism correction. AXIS values should not be provided.", 400);

                // Rule 4: AXIS outside lens AxisMin–AxisMax range (needs attr.AxisMin/Max from DB)
                if (dto.AxisOD.HasValue && (dto.AxisOD.Value < attr.AxisMin || dto.AxisOD.Value > attr.AxisMax))
                    return Result<CartItemDto>.Failure(
                        $"Right eye AXIS ({dto.AxisOD.Value}°) is outside this lens range ({attr.AxisMin}° to {attr.AxisMax}°).", 400);

                if (dto.AxisOS.HasValue && (dto.AxisOS.Value < attr.AxisMin || dto.AxisOS.Value > attr.AxisMax))
                    return Result<CartItemDto>.Failure(
                        $"Left eye AXIS ({dto.AxisOS.Value}°) is outside this lens range ({attr.AxisMin}° to {attr.AxisMax}°).", 400);

                // ADD validation: only valid for Progressive / Bifocal (needs attr.LensDesign from DB)
                if ((dto.AddOD.HasValue || dto.AddOS.HasValue) && attr.LensDesign == LensDesign.SingleVision)
                    return Result<CartItemDto>.Failure(
                        "ADD values cannot be used with Single Vision lenses.", 400);



                // ── 3. Validate coating IDs ────────────────────────────────
                if (dto.SelectedCoatingIds is { Count: > 0 })
                {
                    List<LensCoatingOption> coatings = await context.LensCoatingOptions
                        .AsNoTracking()
                        .Where(c => dto.SelectedCoatingIds.Contains(c.Id)
                                 && c.LensProductId == lensVariant.ProductId
                                 && c.IsActive)
                        .ToListAsync(cancellationToken);

                    if (coatings.Count != dto.SelectedCoatingIds.Count)
                        return Result<CartItemDto>.Failure(
                            "One or more selected coating options are invalid or do not belong to this lens product.", 400);

                    coatingExtraPrice = coatings.Sum(c => c.ExtraPrice);
                    coatingIdsJson = JsonSerializer.Serialize(dto.SelectedCoatingIds);
                }
            }

            // ── 4. Get or create cart ────────────────────────────────────
            Cart? cart = await context.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == CartStatus.Active, cancellationToken);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    Status = CartStatus.Active,
                    CreatedAt = DateTime.UtcNow
                };
                context.Carts.Add(cart);
                await context.SaveChangesAsync(cancellationToken);
            }

            // ── 5. Create CartItem ───────────────────────────────────────
            CartItem cartItem = new()
            {
                CartId           = cart.Id,
                ProductVariantId = dto.ProductVariantId,
                Quantity         = dto.Quantity,

                // Lens selection
                LensVariantId    = dto.LensVariantId,
                CoatingExtraPrice     = coatingExtraPrice,
                SelectedCoatingIdsJson = coatingIdsJson,

                // Prescription (inline snapshot)
                PrescriptionSphOD  = dto.SphOD,
                PrescriptionCylOD  = dto.CylOD,
                PrescriptionAxisOD = dto.AxisOD,
                PrescriptionAddOD  = dto.AddOD,
                PrescriptionPdOD   = dto.PdOD,

                PrescriptionSphOS  = dto.SphOS,
                PrescriptionCylOS  = dto.CylOS,
                PrescriptionAxisOS = dto.AxisOS,
                PrescriptionAddOS  = dto.AddOS,
                PrescriptionPdOS   = dto.PdOS,

                PrescriptionPd = dto.Pd,
            };
            context.CartItems.Add(cartItem);

            cart.UpdatedAt = DateTime.UtcNow;
            bool success = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!success)
                return Result<CartItemDto>.Failure("Failed to add item to cart.", 500);

            CartItemDto? cartItemDto = await context.CartItems
                .AsNoTracking()
                .Where(ci => ci.Id == cartItem.Id)
                .ProjectTo<CartItemDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (cartItemDto == null)
                return Result<CartItemDto>.Failure("Failed to retrieve cart item.", 500);

            return Result<CartItemDto>.Success(cartItemDto);
        }
    }
}

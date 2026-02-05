using Application.Carts.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
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

            // Validate ProductVariant exists and is active
            ProductVariant? productVariant = await context.ProductVariants
                .Include(pv => pv.Stock)
                .Include(pv => pv.Product)
                .Include(pv => pv.Images)
                .FirstOrDefaultAsync(pv => pv.Id == request.AddCartItemDto.ProductVariantId, cancellationToken);

            if (productVariant == null)
            {
                return Result<CartItemDto>.Failure("Product variant not found.", 404);
            }

            if (!productVariant.IsActive)
            {
                return Result<CartItemDto>.Failure("Product variant is not available.", 400);
            }

            // Check stock availability (only validate, don't reserve yet)
            if (productVariant.Stock == null || productVariant.Stock.QuantityAvailable < request.AddCartItemDto.Quantity)
            {
                return Result<CartItemDto>.Failure(
                    $"Insufficient stock. Only {productVariant.Stock?.QuantityAvailable ?? 0} items available.", 400);
            }

            // Get or create active cart for user
            Cart? cart = await context.Carts
                .Include(c => c.Items)
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
            }

            // Check if item already exists in cart (should be prevented by unique constraint, but check anyway)
            CartItem? existingItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == request.AddCartItemDto.ProductVariantId);

            if (existingItem != null)
            {
                // Update quantity
                int newQuantity = existingItem.Quantity + request.AddCartItemDto.Quantity;

                // Re-validate stock for new total quantity
                if (productVariant.Stock.QuantityAvailable < newQuantity)
                {
                    return Result<CartItemDto>.Failure(
                        $"Insufficient stock. You already have {existingItem.Quantity} in cart. Only {productVariant.Stock.QuantityAvailable} items available.", 400);
                }

                existingItem.Quantity = newQuantity;
                cart.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Add new item
                CartItem cartItem = new()
                {
                    CartId = cart.Id,
                    ProductVariantId = request.AddCartItemDto.ProductVariantId,
                    Quantity = request.AddCartItemDto.Quantity
                };
                cart.Items.Add(cartItem);
                cart.UpdatedAt = DateTime.UtcNow;
            }

            bool success = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!success)
            {
                return Result<CartItemDto>.Failure("Failed to add item to cart.", 500);
            }

            // Reload the cart item with all navigation properties for mapping
            CartItem? addedItem = await context.CartItems
                .Include(ci => ci.ProductVariant)
                    .ThenInclude(pv => pv.Stock)
                .Include(ci => ci.ProductVariant)
                    .ThenInclude(pv => pv.Product)
                .Include(ci => ci.ProductVariant)
                    .ThenInclude(pv => pv.Images)
                .FirstOrDefaultAsync(ci => ci.CartId == cart.Id 
                    && ci.ProductVariantId == request.AddCartItemDto.ProductVariantId, cancellationToken);

            CartItemDto cartItemDto = mapper.Map<CartItemDto>(addedItem);
            return Result<CartItemDto>.Success(cartItemDto);
        }
    }
}

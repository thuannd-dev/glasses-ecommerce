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

            // Validate ProductVariant exists, is active, and has stock
            ProductVariant? productVariant = await context.ProductVariants
                .AsNoTracking()
                .Include(pv => pv.Stock)
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

            // Get or create active cart for user (without Items to avoid tracking issues)
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

            // Check if item already exists in cart
            CartItem? existingItem = await context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cart.Id 
                    && ci.ProductVariantId == request.AddCartItemDto.ProductVariantId, cancellationToken);

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
                context.CartItems.Add(cartItem);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            bool success = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!success)
            {
                return Result<CartItemDto>.Failure("Failed to add item to cart.", 500);
            }

            // Use ProjectTo for optimal performance - only select needed data
            CartItemDto? cartItemDto = await context.CartItems
                .Where(ci => ci.CartId == cart.Id 
                    && ci.ProductVariantId == request.AddCartItemDto.ProductVariantId)
                .ProjectTo<CartItemDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (cartItemDto == null)
            {
                return Result<CartItemDto>.Failure("Failed to retrieve cart item.", 500);
            }

            return Result<CartItemDto>.Success(cartItemDto);
        }
    }
}

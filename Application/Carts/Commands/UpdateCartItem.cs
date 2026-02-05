using Application.Carts.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Carts.Commands;

public sealed class UpdateCartItem
{
    public sealed class Command : IRequest<Result<CartItemDto>>
    {
        public required Guid CartItemId { get; set; }
        public required UpdateCartItemDto UpdateCartItemDto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<CartItemDto>>
    {
        public async Task<Result<CartItemDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            // Find cart item with necessary includes
            CartItem? cartItem = await context.CartItems
                .Include(ci => ci.Cart)
                .Include(ci => ci.ProductVariant)
                    .ThenInclude(pv => pv.Stock)
                .Include(ci => ci.ProductVariant)
                    .ThenInclude(pv => pv.Product)
                .Include(ci => ci.ProductVariant)
                    .ThenInclude(pv => pv.Images)
                .FirstOrDefaultAsync(ci => ci.Id == request.CartItemId, cancellationToken);

            if (cartItem == null)
            {
                return Result<CartItemDto>.Failure("Cart item not found.", 404);
            }

            // Verify cart belongs to user
            if (cartItem.Cart.UserId != userId)
            {
                return Result<CartItemDto>.Failure("Unauthorized access to cart item.", 403);
            }

            // Verify cart is active
            if (cartItem.Cart.Status != CartStatus.Active)
            {
                return Result<CartItemDto>.Failure("Cannot update items in inactive cart.", 400);
            }

            // Validate ProductVariant is still active
            if (!cartItem.ProductVariant.IsActive)
            {
                return Result<CartItemDto>.Failure("Product variant is no longer available.", 400);
            }

            // Check stock availability for new quantity
            if (cartItem.ProductVariant.Stock == null 
                || cartItem.ProductVariant.Stock.QuantityAvailable < request.UpdateCartItemDto.Quantity)
            {
                return Result<CartItemDto>.Failure(
                    $"Insufficient stock. Only {cartItem.ProductVariant.Stock?.QuantityAvailable ?? 0} items available.", 400);
            }

            // Update quantity
            if (cartItem.Quantity != request.UpdateCartItemDto.Quantity)
            {
                cartItem.Quantity = request.UpdateCartItemDto.Quantity;
                cartItem.Cart.UpdatedAt = DateTime.UtcNow;
            }

            bool success = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!success && cartItem.Quantity != request.UpdateCartItemDto.Quantity)
            {
                return Result<CartItemDto>.Failure("Failed to update cart item.", 500);
            }

            CartItemDto cartItemDto = mapper.Map<CartItemDto>(cartItem);
            return Result<CartItemDto>.Success(cartItemDto);
        }
    }
}

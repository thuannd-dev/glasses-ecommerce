using Application.Carts.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
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
        IUserAccessor userAccessor,
        IHttpContextAccessor httpContextAccessor) : IRequestHandler<Command, Result<CartItemDto>>
    {
        public async Task<Result<CartItemDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            // Try to get authenticated user ID, or null if not authenticated
            Guid? userId = userAccessor.GetUserIdOrNull();

            // If user is not authenticated, get or create an anonymous session ID
            if (userId == null)
            {
                string? sessionId = httpContextAccessor.HttpContext?.Session.GetString("AnonymousCartSessionId");
                if (string.IsNullOrWhiteSpace(sessionId))
                {
                    // Generate a new session ID for anonymous users
                    sessionId = Guid.NewGuid().ToString();
                    httpContextAccessor.HttpContext?.Session.SetString("AnonymousCartSessionId", sessionId);
                }

                // Use a special Guid format for anonymous session ID
                // Format: Use first 16 bytes of sessionId hash as the Guid
                byte[] sessionBytes = System.Text.Encoding.UTF8.GetBytes(sessionId);
                using var hash = System.Security.Cryptography.SHA256.Create();
                byte[] hashBytes = hash.ComputeHash(sessionBytes);
                userId = new Guid(hashBytes[..16]);
            }

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

            // Chỉ kiểm tra stock khi variant KHÔNG phải PreOrder
            if (!productVariant.IsPreOrder)
            {
                if (productVariant.Stock == null || productVariant.Stock.QuantityAvailable < request.AddCartItemDto.Quantity)
                {
                    return Result<CartItemDto>.Failure(
                        $"Insufficient stock. Only {productVariant.Stock?.QuantityAvailable ?? 0} items available.", 400);
                }
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

                // Re-validate stock cho new total quantity, chỉ khi không phải PreOrder
                if (!productVariant.IsPreOrder
                    && productVariant.Stock!.QuantityAvailable < newQuantity)
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

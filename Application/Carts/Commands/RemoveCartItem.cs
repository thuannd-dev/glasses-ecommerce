using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Carts.Commands;

public sealed class RemoveCartItem
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid CartItemId { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            // Find cart item
            CartItem? cartItem = await context.CartItems
                .Include(ci => ci.Cart)
                .FirstOrDefaultAsync(ci => ci.Id == request.CartItemId, cancellationToken);

            if (cartItem == null)
            {
                return Result<Unit>.Failure("Cart item not found.", 404);
            }

            if (cartItem.Cart == null)
            {
                return Result<Unit>.Failure("Cart not found for cart item.", 404);
            }

            // Verify cart belongs to user
            if (cartItem.Cart.UserId != userId)
            {
                return Result<Unit>.Failure("Unauthorized access to cart item.", 403);
            }

            // Verify cart is active
            if (cartItem.Cart.Status != CartStatus.Active)
            {
                return Result<Unit>.Failure("Cannot remove items from inactive cart.", 400);
            }

            // Remove item
            context.CartItems.Remove(cartItem);
            cartItem.Cart.UpdatedAt = DateTime.UtcNow;

            bool success = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!success)
            {
                return Result<Unit>.Failure("Failed to remove cart item.", 500);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

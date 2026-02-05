using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Carts.Commands;

public sealed class ClearCart
{
    public sealed class Command : IRequest<Result<Unit>>;

    internal sealed class Handler(
        AppDbContext context,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            // Find active cart
            Cart? cart = await context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == CartStatus.Active, cancellationToken);

            if (cart == null)
            {
                return Result<Unit>.Failure("Active cart not found.", 404);
            }

            if (!cart.Items.Any())
            {
                return Result<Unit>.Success(Unit.Value); // Cart is already empty
            }

            // Remove all items
            context.CartItems.RemoveRange(cart.Items);
            cart.UpdatedAt = DateTime.UtcNow;

            bool success = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!success)
            {
                return Result<Unit>.Failure("Failed to clear cart.", 500);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

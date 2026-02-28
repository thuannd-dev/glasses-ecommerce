using System.Data;
using Application.Core;
using Application.Interfaces;
using Application.Inventory.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Persistence;

namespace Application.Inventory.Commands;

public sealed class RecordOutbound
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required RecordOutboundDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            Guid staffUserId = userAccessor.GetUserId();

            return await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                // Clear stale change-tracker state so each retry attempt starts fresh.
                context.ChangeTracker.Clear();

                // Serializable prevents phantom reads: two concurrent requests can both pass
                // AnyAsync (no outbound yet) under RepeatableRead, then both insert.
                // Serializable holds a range lock that blocks the second request's insert.
                await using IDbContextTransaction transaction =
                    await context.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

                // 1. Validate order exists
                Order? order = await context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == request.Dto.OrderId, ct);

                if (order == null)
                    return Result<Unit>.Failure("Order not found.", 404);

                // 2. Validate order status is eligible
                if (order.OrderStatus != OrderStatus.Confirmed
                    && order.OrderStatus != OrderStatus.Processing
                    && order.OrderStatus != OrderStatus.Shipped)
                {
                    return Result<Unit>.Failure(
                        $"Cannot record outbound for order with status '{order.OrderStatus}'.", 400);
                }

                // 3. Check if outbound already recorded for this order
                bool alreadyRecorded = await context.InventoryTransactions
                    .AnyAsync(t => t.ReferenceType == ReferenceType.Order
                        && t.ReferenceId == order.Id
                        && t.TransactionType == TransactionType.Outbound, ct);

                if (alreadyRecorded)
                    return Result<Unit>.Failure("Outbound already recorded for this order.", 409);

                // 4. Create inventory transactions for each order item
                if (order.OrderItems.Count == 0)
                    return Result<Unit>.Failure("Order has no items to record outbound.", 400);

                foreach (OrderItem item in order.OrderItems)
                {
                    context.InventoryTransactions.Add(new InventoryTransaction
                    {
                        UserId = staffUserId,
                        ProductVariantId = item.ProductVariantId,
                        TransactionType = TransactionType.Outbound,
                        Quantity = item.Quantity,
                        ReferenceType = ReferenceType.Order,
                        ReferenceId = order.Id,
                        Status = InventoryTransactionStatus.Completed,
                        Notes = $"Outbound for order #{order.Id}",
                        CreatedBy = staffUserId,
                        ApprovedAt = DateTime.UtcNow,
                        ApprovedBy = staffUserId,
                    });
                }

                bool success = await context.SaveChangesAsync(ct) > 0;

                if (!success)
                    return Result<Unit>.Failure("Failed to record outbound.", 500);

                await transaction.CommitAsync(ct);

                return Result<Unit>.Success(Unit.Value);
            });
        }
    }
}

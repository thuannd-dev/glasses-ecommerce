using System.Data;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Persistence;

namespace Application.Inventory.Commands;

public sealed class ApproveInbound
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid InboundRecordId { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            Guid managerUserId = userAccessor.GetUserId();

            // SqlServerRetryingExecutionStrategy does not support user-initiated transactions directly.
            // Wrap everything in ExecuteAsync so the strategy can retry the entire unit of work.
            return await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                // Clear any stale tracked state from a previous (failed) attempt so that
                // retried stock mutations and InventoryTransaction inserts start fresh.
                context.ChangeTracker.Clear();

                // Use RepeatableRead to prevent race condition on stock updates
                await using IDbContextTransaction transaction =
                    await context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, ct);

                // 1. Load inbound record with UPDLOCK + HOLDLOCK to prevent deadlock:
                //    Without UPDLOCK: both requests get shared locks (S), then try to upgrade
                //    to exclusive locks (X) simultaneously → deadlock.
                //    UPDLOCK acquires update-intent lock upfront (no upgrade needed later).
                //    HOLDLOCK keeps the lock until transaction commits (RepeatableRead only
                //    prevents re-reads, not S→X upgrade within the same transaction).
                InboundRecord? record = await context.InboundRecords
                    .FromSqlRaw(
                        "SELECT * FROM InboundRecords WITH (UPDLOCK, HOLDLOCK) WHERE Id = @p0",
                        request.InboundRecordId)
                    .Include(ir => ir.Items)
                    .FirstOrDefaultAsync(ct);

                if (record == null)
                    return Result<Unit>.Failure("Inbound record not found.", 404);

                if (record.Status != InboundRecordStatus.PendingApproval)
                    return Result<Unit>.Failure(
                        $"Cannot approve inbound record with status '{record.Status}'.", 400);

                // 2. Self-approval check: manager cannot approve their own record
                if (record.CreatedBy == managerUserId)
                    return Result<Unit>.Failure(
                        "Cannot approve an inbound record you created.", 400);

                // 3. Guard: record must have items
                if (!record.Items.Any())
                    return Result<Unit>.Failure("Inbound record has no items to approve.", 400);

                // 4. Map SourceType → ReferenceType once (depends only on the record, not per-item)
                ReferenceType? referenceType = record.SourceType switch
                {
                    SourceType.Supplier => ReferenceType.Supplier,
                    SourceType.Return => ReferenceType.Return,
                    SourceType.Adjustment => ReferenceType.Adjustment,
                    _ => (ReferenceType?)null
                };

                if (referenceType is null)
                    return Result<Unit>.Failure(
                        $"Unsupported source type '{record.SourceType}'.", 400);

                // 5. Load stocks with UPDLOCK to prevent race condition
                List<Guid> variantIds = [.. record.Items.Select(i => i.ProductVariantId)];
                string paramList = string.Join(", ", variantIds.Select((_, i) => $"@p{i}"));
                object[] sqlParams = variantIds
                    .Select((id, i) => (object)new SqlParameter($"@p{i}", id)).ToArray();

                List<Stock> stocks = await context.Stocks
                    .FromSqlRaw($"SELECT * FROM Stocks WITH (UPDLOCK) WHERE ProductVariantId IN ({paramList})", sqlParams)
                    .ToListAsync(ct);

                // 6. Update stock for each item
                Dictionary<Guid, Stock> stockByVariant = stocks.ToDictionary(s => s.ProductVariantId);

                foreach (InboundRecordItem item in record.Items)
                {
                    if (item.Quantity <= 0)
                        return Result<Unit>.Failure(
                            $"Item quantity must be positive for product variant '{item.ProductVariantId}'.", 400);

                    if (!stockByVariant.TryGetValue(item.ProductVariantId, out Stock? stock))
                        return Result<Unit>.Failure(
                            $"Stock record not found for product variant '{item.ProductVariantId}'. " +
                            "Ensure stock records exist before approving inbound.", 400);

                    stock.QuantityOnHand += item.Quantity;
                    stock.UpdatedAt = DateTime.UtcNow;
                    stock.UpdatedBy = managerUserId;

                    // Create inventory transaction for audit
                    context.InventoryTransactions.Add(new InventoryTransaction
                    {
                        UserId = managerUserId,
                        ProductVariantId = item.ProductVariantId,
                        TransactionType = TransactionType.Inbound,
                        Quantity = item.Quantity,
                        ReferenceType = referenceType.Value,
                        ReferenceId = record.Id,
                        Status = InventoryTransactionStatus.Completed,
                        Notes = $"Inbound approved from record #{record.Id}",
                        CreatedBy = record.CreatedBy,
                        ApprovedAt = DateTime.UtcNow,
                        ApprovedBy = managerUserId,
                    });
                }

                // 6. Update record status
                record.Status = InboundRecordStatus.Approved;
                record.ApprovedAt = DateTime.UtcNow;
                record.ApprovedBy = managerUserId;

                // 7. Save and commit
                bool success = await context.SaveChangesAsync(ct) > 0;

                if (!success)
                    return Result<Unit>.Failure("Failed to approve inbound record.", 500);

                await transaction.CommitAsync(ct);

                return Result<Unit>.Success(Unit.Value);
            });
        }
    }
}

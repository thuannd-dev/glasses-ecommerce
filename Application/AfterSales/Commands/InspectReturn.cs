using System.Data;
using Application.AfterSales.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Persistence;

namespace Application.AfterSales.Commands;

public sealed class InspectReturn
{
    public sealed class Command : IRequest<Result<TicketDetailDto>>
    {
        public required Guid TicketId { get; set; }
        public required InspectReturnDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<TicketDetailDto>>
    {
        public async Task<Result<TicketDetailDto>> Handle(Command request, CancellationToken ct)
        {
            Guid staffId = userAccessor.GetUserId();

            return await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                context.ChangeTracker.Clear();

                // Use RepeatableRead because CASE B and CASE D mutate stock
                await using IDbContextTransaction transaction =
                    await context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, ct);

                AfterSalesTicket? ticket = await context.AfterSalesTickets
                    .Include(t => t.Order)
                    .ThenInclude(o => o.OrderItems)
                    .FirstOrDefaultAsync(t => t.Id == request.TicketId, ct);

                if (ticket == null)
                    return Result<TicketDetailDto>.Failure("Ticket not found.", 404);

                if (ticket.TicketStatus != AfterSalesTicketStatus.InProgress)
                    return Result<TicketDetailDto>.Failure(
                        $"Cannot inspect a ticket with status '{ticket.TicketStatus}'.", 400);

                if (!ticket.ReceivedAt.HasValue)
                    return Result<TicketDetailDto>.Failure(
                        "Goods must be marked as received before inspection.", 400);

                if (ticket.ResolutionType == null ||
                    ticket.ResolutionType == TicketResolutionType.RefundOnly)
                    return Result<TicketDetailDto>.Failure(
                        "This ticket does not require physical inspection.", 400);

                // If rejected by Ops: close the ticket change status to rejected without stock changes
                if (!request.Dto.IsAccepted)
                {
                    ticket.TicketStatus = AfterSalesTicketStatus.Rejected;
                    ticket.StaffNotes = string.IsNullOrWhiteSpace(request.Dto.Notes)
                        ? null
                        : request.Dto.Notes;
                    ticket.ResolvedAt = DateTime.UtcNow;

                    bool saved = await context.SaveChangesAsync(ct) > 0;
                    if (!saved)
                        return Result<TicketDetailDto>.Failure("Failed to update ticket.", 500);

                    await transaction.CommitAsync(ct);

                    TicketDetailDto? rejectedDto = await context.AfterSalesTickets
                        .AsNoTracking()
                        .Where(t => t.Id == ticket.Id)
                        .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                        .FirstOrDefaultAsync(ct);

                    return rejectedDto != null
                        ? Result<TicketDetailDto>.Success(rejectedDto)
                        : Result<TicketDetailDto>.Failure("Failed to retrieve updated ticket.", 500);
                }

                // Determine which order items are in scope
                List<OrderItem> scopedItems = ticket.OrderItemId.HasValue
                    ? ticket.Order.OrderItems.Where(i => i.Id == ticket.OrderItemId.Value).ToList()
                    : ticket.Order.OrderItems.ToList();

                if (scopedItems.Count == 0)
                    return Result<TicketDetailDto>.Failure("No order items found for this ticket.", 400);

                // CASE B: ReturnAndRefund — restore stock + create Refund
                // CASE D: WarrantyReplace  — deduct stock for replacement unit
                // CASE C: WarrantyRepair   — no stock change
                if (ticket.ResolutionType == TicketResolutionType.ReturnAndRefund ||
                    ticket.ResolutionType == TicketResolutionType.WarrantyReplace)
                {
                    List<Guid> variantIds = [.. scopedItems.Select(i => i.ProductVariantId)];
                    string paramList = string.Join(", ", variantIds.Select((_, i) => $"@p{i}"));
                    object[] sqlParams = variantIds
                        .Select((id, i) => (object)new SqlParameter($"@p{i}", id)).ToArray();

                    List<Stock> stocks = await context.Stocks
                        .FromSqlRaw(
                            $"SELECT * FROM Stocks WITH (UPDLOCK) WHERE ProductVariantId IN ({paramList})",
                            sqlParams)
                        .ToListAsync(ct);

                    Dictionary<Guid, Stock> stockByVariant = stocks.ToDictionary(s => s.ProductVariantId);

                    foreach (OrderItem item in scopedItems)
                    {
                        if (!stockByVariant.TryGetValue(item.ProductVariantId, out Stock? stock))
                            return Result<TicketDetailDto>.Failure(
                                $"Stock record not found for variant '{item.ProductVariantId}'.", 409);

                        if (ticket.ResolutionType == TicketResolutionType.ReturnAndRefund)
                        {
                            // Restore returned goods to on-hand stock
                            stock.QuantityOnHand += item.Quantity;
                            stock.UpdatedAt = DateTime.UtcNow;
                            stock.UpdatedBy = staffId;

                            context.InventoryTransactions.Add(new InventoryTransaction
                            {
                                UserId = staffId,
                                ProductVariantId = item.ProductVariantId,
                                TransactionType = TransactionType.Inbound,
                                Quantity = item.Quantity,
                                ReferenceType = ReferenceType.Return,
                                ReferenceId = ticket.Id,
                                Status = InventoryTransactionStatus.Completed,
                                Notes = $"Return accepted from ticket #{ticket.Id}"
                            });
                        }
                        else // WarrantyReplace — send out a replacement unit
                        {
                            if (stock.QuantityAvailable < item.Quantity)
                                return Result<TicketDetailDto>.Failure(
                                    $"Insufficient stock to fulfill warranty replacement for variant '{item.ProductVariantId}'. " +
                                    $"Available: {stock.QuantityAvailable}, Required: {item.Quantity}.", 409);

                            stock.QuantityOnHand -= item.Quantity;
                            stock.UpdatedAt = DateTime.UtcNow;
                            stock.UpdatedBy = staffId;

                            context.InventoryTransactions.Add(new InventoryTransaction
                            {
                                UserId = staffId,
                                ProductVariantId = item.ProductVariantId,
                                TransactionType = TransactionType.Outbound,
                                Quantity = item.Quantity,
                                ReferenceType = ReferenceType.Return,
                                ReferenceId = ticket.Id,
                                Status = InventoryTransactionStatus.Completed,
                                Notes = $"Warranty replacement dispatched for ticket #{ticket.Id}"
                            });
                        }
                    }

                    // Create Refund for ReturnAndRefund case
                    if (ticket.ResolutionType == TicketResolutionType.ReturnAndRefund)
                    {
                        Payment? payment = await context.Payments
                            .AsNoTracking()
                            .Where(p => p.OrderId == ticket.OrderId &&
                                        p.PaymentStatus == PaymentStatus.Completed)
                            .OrderByDescending(p => p.PaymentAt)
                            .FirstOrDefaultAsync(ct);

                        if (payment == null)
                            return Result<TicketDetailDto>.Failure(
                                "No completed payment found for this order. Cannot process refund.", 400);

                        decimal refundAmount = ticket.RefundAmount
                            ?? scopedItems.Sum(i => i.UnitPrice * i.Quantity);

                        decimal existingRefunds = await context.Refunds
                            .Where(r => r.PaymentId == payment.Id && r.RefundStatus != RefundStatus.Rejected)
                            .SumAsync(r => r.Amount, ct);

                        if (existingRefunds + refundAmount > payment.Amount)
                            return Result<TicketDetailDto>.Failure(
                                $"Cumulative refund amount ({(existingRefunds + refundAmount):C}) exceeds original payment ({payment.Amount:C}).", 400);

                        context.Refunds.Add(new Refund
                        {
                            PaymentId = payment.Id,
                            Amount = refundAmount,
                            RefundStatus = RefundStatus.Pending,
                            RefundReason = ticket.Reason
                        });

                        ticket.RefundAmount = refundAmount;
                    }
                }
                // CASE C: WarrantyRepair — no stock mutation, just resolve

                ticket.TicketStatus = AfterSalesTicketStatus.Resolved;
                ticket.StaffNotes = string.IsNullOrWhiteSpace(request.Dto.Notes)
                    ? null
                    : request.Dto.Notes;
                ticket.ResolvedAt = DateTime.UtcNow;

                bool isSuccess = await context.SaveChangesAsync(ct) > 0;

                if (!isSuccess)
                    return Result<TicketDetailDto>.Failure("Failed to process inspection.", 500);

                await transaction.CommitAsync(ct);

                TicketDetailDto? dto = await context.AfterSalesTickets
                    .AsNoTracking()
                    .Where(t => t.Id == ticket.Id)
                    .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync(ct);

                if (dto == null)
                    return Result<TicketDetailDto>.Failure("Failed to retrieve updated ticket.", 500);

                return Result<TicketDetailDto>.Success(dto);
            });
        }
    }
}

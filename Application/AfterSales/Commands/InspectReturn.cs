using System.Data;
using Application.AfterSales.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
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

            Result<Guid> strategyResult = await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
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
                    return Result<Guid>.Failure("Ticket not found.", 404);

                if (ticket.TicketStatus != AfterSalesTicketStatus.InProgress)
                    return Result<Guid>.Failure(
                        $"Cannot inspect a ticket with status '{ticket.TicketStatus}'.", 400);

                if (!ticket.ReceivedAt.HasValue)
                    return Result<Guid>.Failure(
                        "Goods must be marked as received before inspection.", 400);

                if (ticket.ResolutionType == null ||
                    ticket.ResolutionType == TicketResolutionType.RefundOnly)
                    return Result<Guid>.Failure(
                        "This ticket does not require physical inspection.", 400);

                // If rejected by Ops: close the ticket, change status to Rejected without stock changes
                if (!request.Dto.IsAccepted)
                {
                    ticket.TicketStatus = AfterSalesTicketStatus.Rejected;
                    ticket.StaffNotes = string.IsNullOrWhiteSpace(request.Dto.Notes)
                        ? null
                        : request.Dto.Notes;
                    ticket.ResolvedAt = DateTime.UtcNow;

                    bool saved = await context.SaveChangesAsync(ct) > 0;
                    if (!saved)
                        return Result<Guid>.Failure("Failed to update ticket.", 500);

                    await transaction.CommitAsync(ct);

                    return Result<Guid>.Success(ticket.Id);
                }

                // Determine which order items are in scope
                List<OrderItem> scopedItems = ticket.OrderItemId.HasValue
                    ? ticket.Order.OrderItems.Where(i => i.Id == ticket.OrderItemId.Value).ToList()
                    : ticket.Order.OrderItems.ToList();

                if (scopedItems.Count == 0)
                    return Result<Guid>.Failure("No order items found for this ticket.", 400);

                // CASE B: ReturnAndRefund — restore stock + create Refund
                // CASE D: WarrantyReplace  — deduct stock for replacement unit
                // CASE C: WarrantyRepair   — no stock change
                if (ticket.ResolutionType == TicketResolutionType.ReturnAndRefund ||
                    ticket.ResolutionType == TicketResolutionType.WarrantyReplace)
                {
                    List<Guid> variantIds = [.. scopedItems.Select(i => i.ProductVariantId)];
                    List<Stock> stocks = await context.GetStocksWithLockAsync(variantIds, ct);
                    
                    // Load ProductVariants for pre-order auto-disable check
                    List<ProductVariant> variants = await context.ProductVariants
                        .Where(v => variantIds.Contains(v.Id))
                        .ToListAsync(ct);
                    Dictionary<Guid, ProductVariant> variantById = variants.ToDictionary(v => v.Id);
                    
                    Dictionary<Guid, Stock> stockByVariant = stocks.ToDictionary(s => s.ProductVariantId);

                    foreach (OrderItem item in scopedItems)
                    {
                        if (!stockByVariant.TryGetValue(item.ProductVariantId, out Stock? stock))
                            return Result<Guid>.Failure(
                                $"Stock record not found for variant '{item.ProductVariantId}'.", 409);

                        if (ticket.ResolutionType == TicketResolutionType.ReturnAndRefund)
                        {
                            // Restore returned goods to on-hand stock
                            stock.QuantityOnHand += item.Quantity;
                            stock.UpdatedAt = DateTime.UtcNow;
                            stock.UpdatedBy = staffId;

                            // Auto-disable pre-order if stock is now available (QuantityOnHand > 0)
                            if (variantById.TryGetValue(item.ProductVariantId, out ProductVariant? variant) &&
                                variant.IsPreOrder && stock.QuantityOnHand > 0)
                            {
                                variant.IsPreOrder = false;
                            }

                            context.InventoryTransactions.Add(new InventoryTransaction
                            {
                                UserId = staffId,
                                ProductVariantId = item.ProductVariantId,
                                TransactionType = TransactionType.Inbound,
                                Quantity = item.Quantity,
                                ReferenceType = ReferenceType.Return,
                                ReferenceId = ticket.Id,
                                Status = InventoryTransactionStatus.Completed,
                                CreatedBy = staffId,
                                ApprovedBy = staffId,
                                ApprovedAt = DateTime.UtcNow,
                                Notes = $"Return accepted from ticket #{ticket.Id}"
                            });
                        }
                        else // WarrantyReplace — send out a replacement unit
                        {
                            if (stock.QuantityAvailable < item.Quantity)
                                return Result<Guid>.Failure(
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
                                CreatedBy = staffId,
                                ApprovedBy = staffId,
                                ApprovedAt = DateTime.UtcNow,
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
                            return Result<Guid>.Failure(
                                "No completed payment found for this order. Cannot process refund.", 400);

                        decimal refundAmount = ticket.RefundAmount
                            ?? scopedItems.Sum(i => i.UnitPrice * i.Quantity);

                        decimal existingRefunds = await context.Refunds
                            .Where(r => r.PaymentId == payment.Id && r.RefundStatus != RefundStatus.Rejected)
                            .SumAsync(r => r.Amount, ct);

                        if (existingRefunds + refundAmount > payment.Amount)
                            return Result<Guid>.Failure(
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
                    return Result<Guid>.Failure("Failed to process inspection.", 500);

                await transaction.CommitAsync(ct);

                return Result<Guid>.Success(ticket.Id);
            });

            if (!strategyResult.IsSuccess)
                return Result<TicketDetailDto>.Failure(strategyResult.Error!, strategyResult.Code);

            // Read-back query runs outside the execution strategy so that a transient
            // error here does not cause the strategy to retry the already-committed transaction.
            AfterSalesTicket? updatedTicket = await context.AfterSalesTickets
                .AsNoTracking()
                .AsSplitQuery()
                .Where(t => t.Id == strategyResult.Value)
                .Include(t => t.Order)
                .ThenInclude(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductVariant)
                .ThenInclude(pv => pv.Product)
                .ThenInclude(p => p.Images)
                .Include(t => t.OrderItem)
                .ThenInclude(oi => oi.ProductVariant)
                .ThenInclude(pv => pv.Product)
                .ThenInclude(p => p.Images)
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(ct);

            if (updatedTicket == null)
                return Result<TicketDetailDto>.Failure("Failed to retrieve updated ticket.", 500);

            TicketDetailDto dto = mapper.Map<TicketDetailDto>(updatedTicket);
            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

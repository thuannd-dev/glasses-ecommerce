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
        public async Task<Result<TicketDetailDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            Guid staffId = userAccessor.GetUserId();

            Result<Guid> strategyResult = await context.Database.CreateExecutionStrategy().ExecuteAsync(
                () => ProcessInspection(request, staffId, cancellationToken));

            if (!strategyResult.IsSuccess)
                return Result<TicketDetailDto>.Failure(strategyResult.Error!, strategyResult.Code);

            // Read-back query runs outside the execution strategy
            IExecutionStrategy readBackStrategy = context.Database.CreateExecutionStrategy();
            AfterSalesTicket? updatedTicket = await readBackStrategy.ExecuteAsync(() =>
                context.AfterSalesTickets
                    .AsNoTracking()
                    .AsSplitQuery()
                    .Where(t => t.Id == strategyResult.Value)
                    .Include(t => t.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                    .ThenInclude(pv => pv.Product)
                    .ThenInclude(p => p.Images)
                    .Include(t => t.OrderItem!)
                    .ThenInclude(oi => oi.ProductVariant)
                    .ThenInclude(pv => pv.Product)
                    .ThenInclude(p => p.Images)
                    .Include(t => t.Attachments)
                    .FirstOrDefaultAsync(cancellationToken));

            if (updatedTicket == null)
                return Result<TicketDetailDto>.Failure("Failed to retrieve updated ticket.", 500);

            TicketDetailDto dto = mapper.Map<TicketDetailDto>(updatedTicket);
            return Result<TicketDetailDto>.Success(dto);
        }

        private async Task<Result<Guid>> ProcessInspection(Command request, Guid staffId, CancellationToken cancellationToken)
        {
            context.ChangeTracker.Clear();

            // Use RepeatableRead because CASE B and CASE D mutate stock
            await using IDbContextTransaction transaction =
                await context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, cancellationToken);

            AfterSalesTicket? ticket = await context.AfterSalesTickets
                .Include(t => t.Order)
                .ThenInclude(o => o.OrderItems)
                .FirstOrDefaultAsync(t => t.Id == request.TicketId, cancellationToken);

            if (ticket == null)
                return Result<Guid>.Failure("Ticket not found.", 404);

            // Validate ticket preconditions
            Result<Unit> validationResult = ValidateTicketForInspection(ticket);
            if (!validationResult.IsSuccess)
                return Result<Guid>.Failure(validationResult.Error!, validationResult.Code);

            // If rejected by Ops: close the ticket without stock changes
            if (!request.Dto.IsAccepted)
                return await HandleRejection(ticket, request, cancellationToken, transaction);

            // Determine which order items are in scope
            List<OrderItem> scopedItems = GetScopedItems(ticket);
            if (scopedItems.Count == 0)
                return Result<Guid>.Failure("No order items found for this ticket.", 400);

            // Handle stock mutations for ReturnAndRefund and WarrantyReplace
            Result<Unit> mutationResult = await HandleStockMutations(ticket, scopedItems, staffId, cancellationToken);
            if (!mutationResult.IsSuccess)
                return Result<Guid>.Failure(mutationResult.Error!, mutationResult.Code);

            // Handle refund processing for ReturnAndRefund case
            if (ticket.ResolutionType == TicketResolutionType.ReturnAndRefund)
            {
                Result<Unit> refundResult = await HandleRefundCreation(ticket, scopedItems, request, cancellationToken);
                if (!refundResult.IsSuccess)
                    return Result<Guid>.Failure(refundResult.Error!, refundResult.Code);
            }

            // Finalize ticket resolution
            ticket.TicketStatus = AfterSalesTicketStatus.Resolved;
            ticket.StaffNotes = string.IsNullOrWhiteSpace(request.Dto.Notes) ? null : request.Dto.Notes;
            ticket.ResolvedAt = DateTime.UtcNow;

            bool isSuccess = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!isSuccess)
                return Result<Guid>.Failure("Failed to process inspection.", 500);

            await transaction.CommitAsync(cancellationToken);
            return Result<Guid>.Success(ticket.Id);
        }

        private static Result<Unit> ValidateTicketForInspection(AfterSalesTicket ticket)
        {
            if (ticket.TicketStatus != AfterSalesTicketStatus.InProgress)
                return Result<Unit>.Failure(
                    $"Cannot inspect a ticket with status '{ticket.TicketStatus}'.", 400);

            if (!ticket.ReceivedAt.HasValue)
                return Result<Unit>.Failure(
                    "Goods must be marked as received before inspection.", 400);

            if (ticket.ResolutionType == null || ticket.ResolutionType == TicketResolutionType.RefundOnly)
                return Result<Unit>.Failure(
                    "This ticket does not require physical inspection.", 400);

            return Result<Unit>.Success(Unit.Value);
        }

        private async Task<Result<Guid>> HandleRejection(
            AfterSalesTicket ticket,
            Command request,
            CancellationToken cancellationToken,
            IDbContextTransaction transaction)
        {
            ticket.TicketStatus = AfterSalesTicketStatus.Rejected;
            ticket.StaffNotes = string.IsNullOrWhiteSpace(request.Dto.Notes) ? null : request.Dto.Notes;
            ticket.ResolvedAt = DateTime.UtcNow;

            bool saved = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!saved)
                return Result<Guid>.Failure("Failed to update ticket.", 500);

            await transaction.CommitAsync(cancellationToken);
            return Result<Guid>.Success(ticket.Id);
        }

        private static List<OrderItem> GetScopedItems(AfterSalesTicket ticket)
        {
            return ticket.OrderItemId.HasValue
                ? ticket.Order.OrderItems.Where(i => i.Id == ticket.OrderItemId.Value).ToList()
                : ticket.Order.OrderItems.ToList();
        }

        private async Task<Result<Unit>> HandleStockMutations(
            AfterSalesTicket ticket,
            List<OrderItem> scopedItems,
            Guid staffId,
            CancellationToken cancellationToken)
        {
            // Only process stock for ReturnAndRefund or WarrantyReplace
            if (ticket.ResolutionType != TicketResolutionType.ReturnAndRefund &&
                ticket.ResolutionType != TicketResolutionType.WarrantyReplace)
                return Result<Unit>.Success(Unit.Value);

            List<Guid> variantIds = [.. scopedItems.Select(i => i.ProductVariantId)];
            List<Stock> stocks = await context.GetStocksWithLockAsync(variantIds, cancellationToken);

            // Load ProductVariants for pre-order auto-disable check
            List<ProductVariant> variants = await context.ProductVariants
                .Where(v => variantIds.Contains(v.Id))
                .ToListAsync(cancellationToken);
            Dictionary<Guid, ProductVariant> variantById = variants.ToDictionary(v => v.Id);
            Dictionary<Guid, Stock> stockByVariant = stocks.ToDictionary(s => s.ProductVariantId);

            foreach (OrderItem item in scopedItems)
            {
                if (!stockByVariant.TryGetValue(item.ProductVariantId, out Stock? stock))
                    return Result<Unit>.Failure(
                        $"Stock record not found for variant '{item.ProductVariantId}'.", 409);

                if (ticket.ResolutionType == TicketResolutionType.ReturnAndRefund)
                    ProcessReturnAndRefund(stock, item, staffId, ticket, variantById);
                else if (ticket.ResolutionType == TicketResolutionType.WarrantyReplace)
                {
                    Result<Unit> replacementResult = ProcessWarrantyReplace(stock, item, staffId, ticket);
                    if (!replacementResult.IsSuccess)
                        return replacementResult;
                }
            }

            return Result<Unit>.Success(Unit.Value);
        }

        private void ProcessReturnAndRefund(Stock stock, OrderItem item, Guid staffId, AfterSalesTicket ticket, Dictionary<Guid, ProductVariant> variantById)
        {
            // Restore returned goods to on-hand stock
            stock.QuantityOnHand += item.Quantity;
            stock.UpdatedAt = DateTime.UtcNow;
            stock.UpdatedBy = staffId;

            // Auto-disable pre-order if stock is now available
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

        private Result<Unit> ProcessWarrantyReplace(Stock stock, OrderItem item, Guid staffId, AfterSalesTicket ticket)
        {
            // Send out a replacement unit
            if (stock.QuantityAvailable < item.Quantity)
                return Result<Unit>.Failure(
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

            return Result<Unit>.Success(Unit.Value);
        }

        private async Task<Result<Unit>> HandleRefundCreation(
            AfterSalesTicket ticket,
            List<OrderItem> scopedItems,
            Command request,
            CancellationToken cancellationToken)
        {
            // Validate that refund amount is provided
            if (!request.Dto.RefundAmount.HasValue)
                return Result<Unit>.Failure(
                    "Refund amount is required and must be greater than zero for ReturnAndRefund resolution.", 400);

            decimal requestedRefund = request.Dto.RefundAmount.Value;
            if (requestedRefund <= 0)
                return Result<Unit>.Failure(
                    "Refund amount is required and must be greater than zero for ReturnAndRefund resolution.", 400);

            if (decimal.Round(requestedRefund, 2, MidpointRounding.AwayFromZero) != requestedRefund)
                return Result<Unit>.Failure(
                    "Refund amount must have at most 2 decimal places.", 400);

            Payment? payment = await context.Payments
                .AsNoTracking()
                .Where(p => p.OrderId == ticket.OrderId && p.PaymentStatus == PaymentStatus.Completed)
                .OrderByDescending(p => p.PaymentAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (payment == null)
                return Result<Unit>.Failure(
                    "No completed payment found for this order. Cannot process refund.", 400);

            // Calculate maximum refund amount by subtracting discount from items total
            decimal itemsTotal = scopedItems.Sum(i => i.UnitPrice * i.Quantity);
            decimal maximumRefund = itemsTotal - ticket.DiscountApplied;

            // Ensure maximum refund doesn't go negative
            if (maximumRefund < 0)
                maximumRefund = 0;

            // Validate refund amount provided by staff
            if (requestedRefund > maximumRefund)
                return Result<Unit>.Failure(
                    $"Refund amount ({requestedRefund:C}) cannot exceed the maximum allowed ({maximumRefund:C}) = items total ({itemsTotal:C}) minus discount ({ticket.DiscountApplied:C}).", 400);

            decimal existingRefunds = await context.Refunds
                .Where(r => r.PaymentId == payment.Id && r.RefundStatus != RefundStatus.Rejected)
                .SumAsync(r => r.Amount, cancellationToken);

            if (existingRefunds + requestedRefund > payment.Amount)
                return Result<Unit>.Failure(
                    $"Cumulative refund amount ({(existingRefunds + requestedRefund):C}) exceeds original payment ({payment.Amount:C}).", 400);

            context.Refunds.Add(new Refund
            {
                PaymentId = payment.Id,
                Amount = requestedRefund,
                RefundStatus = RefundStatus.Pending,
                RefundReason = ticket.Reason
            });

            ticket.RefundAmount = requestedRefund;
            return Result<Unit>.Success(Unit.Value);
        }
    }
}

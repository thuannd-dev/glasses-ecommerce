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

public sealed class ApproveTicket
{
    public sealed class Command : IRequest<Result<TicketDetailDto>>
    {
        public required Guid TicketId { get; set; }
        public required ApproveTicketDto Dto { get; set; }
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

                await using IDbContextTransaction transaction =
                    await context.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

                AfterSalesTicket? ticket = await context.AfterSalesTickets
                    .FromSql($"SELECT * FROM AfterSalesTickets WITH (UPDLOCK) WHERE Id = {request.TicketId}")
                    .FirstOrDefaultAsync(ct);

                if (ticket == null)
                    return Result<Guid>.Failure("Ticket not found.", 404);

                if (ticket.TicketStatus != AfterSalesTicketStatus.Pending)
                    return Result<Guid>.Failure(
                        $"Cannot approve a ticket with status '{ticket.TicketStatus}'.", 400);

                // Validate ResolutionType is compatible with TicketType
                bool compatible = (ticket.TicketType, request.Dto.ResolutionType) switch
                {
                    (AfterSalesTicketType.Refund, TicketResolutionType.RefundOnly) => true,
                    (AfterSalesTicketType.Return, TicketResolutionType.ReturnAndRefund) => true,
                    (AfterSalesTicketType.Warranty, TicketResolutionType.WarrantyRepair) => true,
                    (AfterSalesTicketType.Warranty, TicketResolutionType.WarrantyReplace) => true,
                    _ => false
                };

                if (!compatible)
                    return Result<Guid>.Failure(
                        $"Resolution type '{request.Dto.ResolutionType}' is not valid for ticket type '{ticket.TicketType}'.", 400);

                ticket.AssignedTo = staffId;
                ticket.ResolutionType = request.Dto.ResolutionType;
                ticket.StaffNotes = string.IsNullOrWhiteSpace(request.Dto.StaffNotes)
                    ? null
                    : request.Dto.StaffNotes;

                // CASE A: RefundOnly — no physical return, resolve immediately
                if (request.Dto.ResolutionType == TicketResolutionType.RefundOnly)
                {
                    if (!request.Dto.RefundAmount.HasValue || request.Dto.RefundAmount.Value <= 0)
                        return Result<Guid>.Failure(
                            "Refund amount is required and must be greater than zero for RefundOnly resolution.", 400);

                    // Calculate total amount of items in the ticket
                    decimal itemsTotal;
                    if (ticket.OrderItemId != null)
                    {
                        // Ticket is for a specific item
                        OrderItem? orderItem = await context.OrderItems
                            .AsNoTracking()
                            .FirstOrDefaultAsync(oi => oi.Id == ticket.OrderItemId, ct);

                        if (orderItem == null)
                            return Result<Guid>.Failure("Order item not found for this ticket.", 404);

                        itemsTotal = orderItem.Quantity * orderItem.UnitPrice;
                    }
                    else
                    {
                        // Ticket is for the whole order
                        itemsTotal = await context.OrderItems
                            .AsNoTracking()
                            .Where(oi => oi.OrderId == ticket.OrderId)
                            .SumAsync(oi => oi.Quantity * oi.UnitPrice, ct);
                    }

                    // Validate refund amount equals items total
                    if (request.Dto.RefundAmount.Value != itemsTotal)
                        return Result<Guid>.Failure(
                            $"Refund amount ({request.Dto.RefundAmount.Value:C}) must equal the total amount of items ({itemsTotal:C}) for RefundOnly resolution.", 400);

                    // Load the most recent completed payment for the order
                    Payment? payment = await context.Payments
                        .AsNoTracking()
                        .Where(p => p.OrderId == ticket.OrderId &&
                                    p.PaymentStatus == PaymentStatus.Completed)
                        .OrderByDescending(p => p.PaymentAt)
                        .FirstOrDefaultAsync(ct);

                    if (payment == null)
                        return Result<Guid>.Failure(
                            "No completed payment found for this order. Cannot process refund.", 400);

                    decimal existingRefunds = await context.Refunds
                        .Where(r => r.PaymentId == payment.Id && r.RefundStatus != RefundStatus.Rejected)
                        .SumAsync(r => r.Amount, ct);

                    if (existingRefunds + request.Dto.RefundAmount.Value > payment.Amount)
                        return Result<Guid>.Failure(
                            $"Cumulative refund amount ({(existingRefunds + request.Dto.RefundAmount.Value):C}) exceeds original payment ({payment.Amount:C}).", 400);

                    context.Refunds.Add(new Refund
                    {
                        PaymentId = payment.Id,
                        Amount = request.Dto.RefundAmount.Value,
                        RefundStatus = RefundStatus.Pending,
                        RefundReason = ticket.Reason
                    });

                    ticket.RefundAmount = request.Dto.RefundAmount.Value;
                    ticket.TicketStatus = AfterSalesTicketStatus.Resolved;
                    ticket.ResolvedAt = DateTime.UtcNow;
                }
                else
                {
                    // CASE B/C/D: physical goods must be received by Ops first
                    ticket.TicketStatus = AfterSalesTicketStatus.InProgress;
                }

                bool isSuccess = await context.SaveChangesAsync(ct) > 0;

                if (!isSuccess)
                    return Result<Guid>.Failure("Failed to approve ticket.", 500);

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
                .Include(t => t.OrderItem!)
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

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

            return await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                context.ChangeTracker.Clear();

                await using IDbContextTransaction transaction =
                    await context.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

                AfterSalesTicket? ticket = await context.AfterSalesTickets
                    .FromSql($"SELECT * FROM AfterSalesTickets WITH (UPDLOCK) WHERE Id = {request.TicketId}")
                    .FirstOrDefaultAsync(ct);

                if (ticket == null)
                    return Result<TicketDetailDto>.Failure("Ticket not found.", 404);

                if (ticket.TicketStatus != AfterSalesTicketStatus.Pending)
                    return Result<TicketDetailDto>.Failure(
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
                    return Result<TicketDetailDto>.Failure(
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
                        return Result<TicketDetailDto>.Failure(
                            "Refund amount is required and must be greater than zero for RefundOnly resolution.", 400);

                    // Load the most recent completed payment for the order
                    Payment? payment = await context.Payments
                        .AsNoTracking()
                        .Where(p => p.OrderId == ticket.OrderId &&
                                    p.PaymentStatus == PaymentStatus.Completed)
                        .OrderByDescending(p => p.PaymentAt)
                        .FirstOrDefaultAsync(ct);

                    if (payment == null)
                        return Result<TicketDetailDto>.Failure(
                            "No completed payment found for this order. Cannot process refund.", 400);

                    decimal existingRefunds = await context.Refunds
                        .Where(r => r.PaymentId == payment.Id && r.RefundStatus != RefundStatus.Rejected)
                        .SumAsync(r => r.Amount, ct);

                    if (existingRefunds + request.Dto.RefundAmount.Value > payment.Amount)
                        return Result<TicketDetailDto>.Failure(
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
                    return Result<TicketDetailDto>.Failure("Failed to approve ticket.", 500);

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

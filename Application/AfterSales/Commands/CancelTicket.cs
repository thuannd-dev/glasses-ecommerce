using Application.AfterSales.DTOs;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Commands;

public sealed class CancelTicket
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid TicketId { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            Guid userId = userAccessor.GetUserId();

            // Load ticket as read-only to avoid change tracking issues
            AfterSalesTicket? ticket = await context.AfterSalesTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == request.TicketId, ct);

            if (ticket == null)
                return Result<Unit>.Failure("Ticket not found.", 404);

            // Only the customer who created the ticket can cancel it
            if (ticket.CustomerId != userId)
                return Result<Unit>.Failure(
                    "You do not have permission to cancel this ticket.", 403);

            // Can only cancel pending tickets
            if (ticket.TicketStatus != AfterSalesTicketStatus.Pending)
                return Result<Unit>.Failure(
                    $"Cannot cancel a ticket with status '{ticket.TicketStatus}'. Only pending tickets can be cancelled.", 400);

            // Update using raw SQL to avoid change tracking complexity
            int rowsAffected = await context.Database.ExecuteSqlInterpolatedAsync(
                $@"UPDATE [AfterSalesTickets]
                   SET [TicketStatus] = {(int)AfterSalesTicketStatus.Cancelled},
                       [ResolvedAt] = {DateTime.UtcNow}
                   WHERE [Id] = {request.TicketId}", ct);

            if (rowsAffected == 0)
                return Result<Unit>.Failure("Failed to cancel ticket.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

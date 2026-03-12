using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Commands;

public sealed class DeleteTicket
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid TicketId { get; set; }
    }

    internal sealed class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            // Load the ticket with its attachments
            AfterSalesTicket? ticket = await context.AfterSalesTickets
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(t => t.Id == request.TicketId, cancellationToken);

            if (ticket == null)
                return Result<Unit>.Failure($"Ticket '{request.TicketId}' not found.", 404);

            // Remove all attachments (cascade delete will handle this, but we're being explicit)
            foreach (TicketAttachment attachment in ticket.Attachments)
            {
                context.TicketAttachments.Remove(attachment);
            }

            // Remove the ticket
            context.AfterSalesTickets.Remove(ticket);

            bool isSuccess = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!isSuccess)
                return Result<Unit>.Failure("Failed to delete ticket. Please try again.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

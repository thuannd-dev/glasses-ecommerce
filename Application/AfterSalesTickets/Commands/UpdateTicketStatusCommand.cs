using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSalesTickets.Commands;

public sealed class UpdateTicketStatusCommand
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid TicketId { get; set; }
        public required AfterSalesTicketStatus NewStatus { get; set; }
        public string? Notes { get; set; }
        public decimal? RefundAmount { get; set; }
    }

    public sealed class Handler(AppDbContext context) 
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var ticket = await context.AfterSalesTickets
                .Include(t => t.Order)
                .FirstOrDefaultAsync(t => t.Id == request.TicketId, cancellationToken);

            if (ticket == null)
            {
                return Result<Unit>.Failure("Ticket not found", 404);
            }

            // Validate policy constraints
            var policyViolation = ValidateTicketPolicy(ticket);

            if (!string.IsNullOrEmpty(policyViolation))
            {
                // Automatically deny if policy violated
                ticket.TicketStatus = AfterSalesTicketStatus.Rejected;
                ticket.PolicyViolation = policyViolation;
                ticket.ResolvedAt = DateTime.UtcNow;
            }
            else
            {
                // Allow status update if no policy violation
                ticket.TicketStatus = request.NewStatus;

                if (request.NewStatus == AfterSalesTicketStatus.Resolved)
                {
                    ticket.ResolvedAt = DateTime.UtcNow;
                }

                if (request.RefundAmount.HasValue)
                {
                    ticket.RefundAmount = request.RefundAmount.Value;
                }
            }

            try
            {
                await context.SaveChangesAsync(cancellationToken);
                return Result<Unit>.Success(Unit.Value);
            }
            catch (Exception ex)
            {
                return Result<Unit>.Failure($"Failed to update ticket: {ex.Message}", 500);
            }
        }

        private static string? ValidateTicketPolicy(AfterSalesTicket ticket)
        {
            var now = DateTime.UtcNow;
            var daysSinceSale = (now - ticket.Order.CreatedAt).TotalDays;

            return ticket.TicketType switch
            {
                AfterSalesTicketType.Warranty when daysSinceSale > 180 =>
                    "Warranty is only available within 6 months of purchase",

                AfterSalesTicketType.Return when daysSinceSale > 7 =>
                    "Return is only available within 7 days of purchase",

                _ => null
            };
        }
    }
}

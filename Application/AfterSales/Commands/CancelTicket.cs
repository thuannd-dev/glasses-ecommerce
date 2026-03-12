using Application.AfterSales.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Commands;

public sealed class CancelTicket
{
    public sealed class Command : IRequest<Result<TicketDetailDto>>
    {
        public required Guid TicketId { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<TicketDetailDto>>
    {
        public async Task<Result<TicketDetailDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            // 1. Load the ticket — must belong to current customer
            AfterSalesTicket? ticket = await context.AfterSalesTickets
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(t =>
                    t.Id == request.TicketId &&
                    t.CustomerId == userId, cancellationToken);

            if (ticket == null)
                return Result<TicketDetailDto>.Failure("Ticket not found.", 404);

            // 2. Check if ticket is in Pending status
            if (ticket.TicketStatus != AfterSalesTicketStatus.Pending)
                return Result<TicketDetailDto>.Failure(
                    $"Cannot cancel ticket — current status is '{ticket.TicketStatus}'. Only pending tickets can be cancelled.", 400);

            // 3. Update ticket status to Closed
            ticket.TicketStatus = AfterSalesTicketStatus.Closed;
            ticket.ResolvedAt = DateTime.UtcNow;

            // 4. Save changes
            await context.SaveChangesAsync(cancellationToken);

            // 5. Map and return the updated ticket
            TicketDetailDto result = mapper.Map<TicketDetailDto>(ticket);
            return Result<TicketDetailDto>.Success(result);
        }
    }
}

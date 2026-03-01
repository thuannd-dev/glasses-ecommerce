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

public sealed class ReceiveReturn
{
    public sealed class Command : IRequest<Result<TicketDetailDto>>
    {
        public required Guid TicketId { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Command, Result<TicketDetailDto>>
    {
        public async Task<Result<TicketDetailDto>> Handle(Command request, CancellationToken ct)
        {
            AfterSalesTicket? ticket = await context.AfterSalesTickets
                .FirstOrDefaultAsync(t => t.Id == request.TicketId, ct);

            if (ticket == null)
                return Result<TicketDetailDto>.Failure("Ticket not found.", 404);

            if (ticket.TicketStatus != AfterSalesTicketStatus.InProgress)
                return Result<TicketDetailDto>.Failure(
                    $"Cannot mark receipt on a ticket with status '{ticket.TicketStatus}'.", 400);

            if (ticket.ResolutionType == null ||
                ticket.ResolutionType == TicketResolutionType.RefundOnly)
                return Result<TicketDetailDto>.Failure(
                    "This ticket does not require physical goods return.", 400);

            if (ticket.ReceivedAt.HasValue)
                return Result<TicketDetailDto>.Failure(
                    "Goods have already been marked as received for this ticket.", 400);

            ticket.ReceivedAt = DateTime.UtcNow;

            bool isSuccess = await context.SaveChangesAsync(ct) > 0;

            if (!isSuccess)
                return Result<TicketDetailDto>.Failure("Failed to update ticket.", 500);

            TicketDetailDto? dto = await context.AfterSalesTickets
                .AsNoTracking()
                .Where(t => t.Id == ticket.Id)
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<TicketDetailDto>.Failure("Failed to retrieve updated ticket.", 500);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

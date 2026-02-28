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

public sealed class RejectTicket
{
    public sealed class Command : IRequest<Result<TicketDetailDto>>
    {
        public required Guid TicketId { get; set; }
        public required RejectTicketDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<TicketDetailDto>>
    {
        public async Task<Result<TicketDetailDto>> Handle(Command request, CancellationToken ct)
        {
            Guid staffId = userAccessor.GetUserId();

            AfterSalesTicket? ticket = await context.AfterSalesTickets
                .FirstOrDefaultAsync(t => t.Id == request.TicketId, ct);

            if (ticket == null)
                return Result<TicketDetailDto>.Failure("Ticket not found.", 404);

            if (ticket.TicketStatus != AfterSalesTicketStatus.Pending &&
                ticket.TicketStatus != AfterSalesTicketStatus.InProgress)
                return Result<TicketDetailDto>.Failure(
                    $"Cannot reject a ticket with status '{ticket.TicketStatus}'.", 400);

            ticket.TicketStatus = AfterSalesTicketStatus.Rejected;
            ticket.StaffNotes = request.Dto.Reason;
            ticket.AssignedTo = staffId;
            ticket.ResolvedAt = DateTime.UtcNow;

            bool isSuccess = await context.SaveChangesAsync(ct) > 0;

            if (!isSuccess)
                return Result<TicketDetailDto>.Failure("Failed to reject ticket.", 500);

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

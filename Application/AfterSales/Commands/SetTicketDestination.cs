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

public sealed class SetTicketDestination
{
    public sealed class Command : IRequest<Result<TicketDetailDto>>
    {
        public required Guid TicketId { get; set; }
        public required SetTicketDestinationDto Dto { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<TicketDetailDto>>
    {
        public async Task<Result<TicketDetailDto>> Handle(Command request, CancellationToken ct)
        {
            AfterSalesTicket? ticket = await context.AfterSalesTickets
                .FirstOrDefaultAsync(t => t.Id == request.TicketId, ct);

            if (ticket == null)
                return Result<TicketDetailDto>.Failure("Ticket not found.", 404);

            if (ticket.TicketStatus != AfterSalesTicketStatus.InProgress)
                return Result<TicketDetailDto>.Failure(
                    $"Cannot set destination on a ticket with status '{ticket.TicketStatus}'.", 400);

            if (!ticket.ReceivedAt.HasValue)
                return Result<TicketDetailDto>.Failure(
                    "Ticket must be marked as received before setting destination.", 400);

            // Handle Reject destination - sets ticket to Rejected status
            if (request.Dto.Destination == "Reject")
            {
                ticket.TicketStatus = AfterSalesTicketStatus.Rejected;
                ticket.ResolvedAt = DateTime.UtcNow;
                ticket.StaffNotes = string.IsNullOrWhiteSpace(request.Dto.Notes)
                    ? "Rejected at operations"
                    : request.Dto.Notes;
            }
            else if (request.Dto.Destination == "Repair")
            {
                // Set resolution to WarrantyRepair if not already set
                if (ticket.ResolutionType != TicketResolutionType.WarrantyRepair)
                    ticket.ResolutionType = TicketResolutionType.WarrantyRepair;

                if (!string.IsNullOrWhiteSpace(request.Dto.Notes))
                    ticket.StaffNotes = request.Dto.Notes;
            }
            else
            {
                return Result<TicketDetailDto>.Failure(
                    "Invalid destination. Must be 'Repair' or 'Reject'.", 400);
            }

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

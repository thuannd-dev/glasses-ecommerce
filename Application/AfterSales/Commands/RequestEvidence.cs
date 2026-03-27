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

public sealed class RequestEvidence
{
    public sealed class Command : IRequest<Result<TicketDetailDto>>
    {
        public required Guid TicketId { get; set; }
        public required RequestEvidenceDto Dto { get; set; }
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
                    $"Cannot request evidence on a ticket with status '{ticket.TicketStatus}'.", 400);

            ticket.IsRequiredEvidence = true;
            ticket.TicketStatus = AfterSalesTicketStatus.InProgress;
            ticket.AssignedTo = staffId;
            ticket.StaffNotes = string.IsNullOrWhiteSpace(request.Dto.Message)
                ? null
                : request.Dto.Message;

            bool isSuccess = await context.SaveChangesAsync(ct) > 0;

            if (!isSuccess)
                return Result<TicketDetailDto>.Failure("Failed to update ticket.", 500);

            AfterSalesTicket? updatedTicket = await context.AfterSalesTickets
                .AsNoTracking()
                .AsSplitQuery()
                .Where(t => t.Id == ticket.Id)
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

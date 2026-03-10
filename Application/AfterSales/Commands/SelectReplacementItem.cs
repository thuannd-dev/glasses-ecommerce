using Application.AfterSales.DTOs;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Commands;

public sealed class SelectReplacementItem
{
    public sealed class Command : IRequest<Result<TicketDetailDto>>
    {
        public required Guid TicketId { get; set; }
        public required Guid ReplacementOrderItemId { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Command, Result<TicketDetailDto>>
    {
        public async Task<Result<TicketDetailDto>> Handle(Command request, CancellationToken ct)
        {
            AfterSalesTicket? ticket = await context.AfterSalesTickets
                .Include(t => t.Order)
                .Include(t => t.Customer)
                .FirstOrDefaultAsync(t => t.Id == request.TicketId, ct);

            if (ticket == null)
                return Result<TicketDetailDto>.Failure("Ticket not found.", 404);

            if (ticket.TicketStatus != AfterSalesTicketStatus.Replacing || !ticket.IsAwaitingReplacement)
                return Result<TicketDetailDto>.Failure(
                    $"Can only select replacement item for tickets in 'Replacing' status. Current status: {ticket.TicketStatus}.", 400);

            // Verify replacement product variant exists in the system
            ProductVariant? replacementVariant = await context.ProductVariants
                .FirstOrDefaultAsync(pv => pv.Id == request.ReplacementOrderItemId, ct);

            if (replacementVariant == null)
                return Result<TicketDetailDto>.Failure(
                    "Replacement product variant not found in the system.", 404);

            // Set replacement and mark ticket as resolved
            ticket.ReplacementProductVariantId = request.ReplacementOrderItemId;
            ticket.IsAwaitingReplacement = false;
            ticket.IsReplacementCompleted = true;
            ticket.TicketStatus = AfterSalesTicketStatus.Resolved;
            ticket.ResolvedAt = TimezoneHelper.GetVietnamNow();

            bool isSuccess = await context.SaveChangesAsync(ct) > 0;

            if (!isSuccess)
                return Result<TicketDetailDto>.Failure("Failed to select replacement item.", 500);

            // Fetch updated ticket with details
            TicketDetailDto? dto = await context.AfterSalesTickets
                .AsNoTracking()
                .Include(t => t.OrderItem!)
                    .ThenInclude(oi => oi.ProductVariant!)
                    .ThenInclude(pv => pv!.Product)
                .Include(t => t.ReplacementProductVariant!)
                    .ThenInclude(pv => pv.Product)
                .Include(t => t.Attachments.Where(a => a.DeletedAt == null))
                .Where(t => t.Id == ticket.Id)
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<TicketDetailDto>.Failure("Failed to retrieve updated ticket.", 500);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

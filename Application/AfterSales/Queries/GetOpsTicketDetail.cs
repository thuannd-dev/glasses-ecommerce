using Application.AfterSales.DTOs;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Queries;

public sealed class GetOpsTicketDetail
{
    public sealed class Query : IRequest<Result<TicketDetailDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Query, Result<TicketDetailDto>>
    {
        public async Task<Result<TicketDetailDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            AfterSalesTicket? ticket = await context.AfterSalesTickets
                .AsNoTracking()
                .AsSplitQuery()
                .Where(t => t.Id == request.Id &&
                            (t.TicketStatus == AfterSalesTicketStatus.InProgress ||
                             t.TicketStatus == AfterSalesTicketStatus.Resolved ||
                             t.TicketStatus == AfterSalesTicketStatus.Rejected) &&
                            t.ResolutionType != null &&
                            t.ResolutionType != TicketResolutionType.RefundOnly)
                .Include(t => t.Order)
                .ThenInclude(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductVariant)
                .ThenInclude(pv => pv.Product)
                .ThenInclude(p => p.Images)
                .Include(t => t.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Prescription)
                    .ThenInclude(p => p!.Details)
                .Include(t => t.OrderItem)
                .ThenInclude(oi => oi.ProductVariant)
                .ThenInclude(pv => pv.Product)
                .ThenInclude(p => p.Images)
                .Include(t => t.OrderItem)
                    .ThenInclude(oi => oi.Prescription)
                    .ThenInclude(p => p!.Details)
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(cancellationToken);

            if (ticket == null)
                return Result<TicketDetailDto>.Failure("Ticket not found or you do not have permission to view it.", 404);

            TicketDetailDto dto = mapper.Map<TicketDetailDto>(ticket);
            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

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
            TicketDetailDto? dto = await context.AfterSalesTickets
                .AsNoTracking()
                .Include(t => t.Order)
                .ThenInclude(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductVariant)
                .ThenInclude(pv => pv.Product)
                .ThenInclude(p => p.Images)
                .Include(t => t.OrderItem)
                .ThenInclude(oi => oi.ProductVariant)
                .ThenInclude(pv => pv.Product)
                .ThenInclude(p => p.Images)
                .Include(t => t.Attachments)
                .Where(t => t.Id == request.Id &&
                            (t.TicketStatus == AfterSalesTicketStatus.InProgress ||
                             t.TicketStatus == AfterSalesTicketStatus.Resolved ||
                             t.TicketStatus == AfterSalesTicketStatus.Rejected) &&
                            t.ResolutionType != null &&
                            t.ResolutionType != TicketResolutionType.RefundOnly)
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (dto == null)
                return Result<TicketDetailDto>.Failure("Ticket not found or you do not have permission to view it.", 404);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

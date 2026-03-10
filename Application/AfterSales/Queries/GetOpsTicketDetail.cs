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
        public async Task<Result<TicketDetailDto>> Handle(Query request, CancellationToken ct)
        {
            TicketDetailDto? dto = await context.AfterSalesTickets
                .AsNoTracking()
                .Include(t => t.OrderItem)
                .ThenInclude(oi => oi!.ProductVariant)
                .ThenInclude(pv => pv!.Product)
                .Include(t => t.ReplacementProductVariant)
                .ThenInclude(pv => pv!.Product)
                .Include(t => t.Attachments.Where(a => a.DeletedAt == null))
                .Include(t => t.Order)
                .ThenInclude(o => o!.Address)
                .Include(t => t.Order)
                .ThenInclude(o => o!.Prescription)
                .ThenInclude(p => p!.Details)
                .Where(t => t.Id == request.Id &&
                            (t.TicketStatus == AfterSalesTicketStatus.InProgress || 
                             t.TicketStatus == AfterSalesTicketStatus.Replacing ||
                             t.TicketStatus == AfterSalesTicketStatus.Rejected ||
                             t.TicketStatus == AfterSalesTicketStatus.Resolved) &&
                            t.ResolutionType != null &&
                            t.ResolutionType != TicketResolutionType.RefundOnly)
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<TicketDetailDto>.Failure("Ticket not found or you do not have permission to view it.", 404);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

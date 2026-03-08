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
                .Where(t => t.Id == request.Id &&
                            t.TicketStatus == AfterSalesTicketStatus.InProgress &&
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

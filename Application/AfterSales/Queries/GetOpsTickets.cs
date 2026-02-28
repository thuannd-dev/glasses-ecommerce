using Application.AfterSales.DTOs;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Queries;

public sealed class GetOpsTickets
{
    public sealed class Query : IRequest<Result<PagedResult<TicketListDto>>>
    {
        public TicketResolutionType? ResolutionType { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Query, Result<PagedResult<TicketListDto>>>
    {
        public async Task<Result<PagedResult<TicketListDto>>> Handle(Query request, CancellationToken ct)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<TicketListDto>>.Failure("Invalid pagination parameters.", 400);

            // Ops only sees InProgress tickets that require physical handling (not RefundOnly)
            IQueryable<AfterSalesTicket> query = context.AfterSalesTickets
                .AsNoTracking()
                .Where(t =>
                    t.TicketStatus == AfterSalesTicketStatus.InProgress &&
                    t.ResolutionType != null &&
                    t.ResolutionType != TicketResolutionType.RefundOnly);

            if (request.ResolutionType.HasValue)
                query = query.Where(t => t.ResolutionType == request.ResolutionType.Value);

            int totalCount = await query.CountAsync(ct);

            List<TicketListDto> items = await query
                .OrderBy(t => t.ReceivedAt.HasValue) // unrecorded receipts first
                .ThenByDescending(t => t.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<TicketListDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            PagedResult<TicketListDto> result = new()
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<TicketListDto>>.Success(result);
        }
    }
}

using Application.AfterSales.DTOs;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Queries;

public sealed class GetStaffTickets
{
    public sealed class Query : IRequest<Result<PagedResult<TicketListDto>>>
    {
        public AfterSalesTicketStatus? Status { get; set; }
        public AfterSalesTicketType? TicketType { get; set; }
        public Guid? OrderId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper) : IRequestHandler<Query, Result<PagedResult<TicketListDto>>>
    {
        public async Task<Result<PagedResult<TicketListDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<TicketListDto>>.Failure("Invalid pagination parameters.", 400);

            IQueryable<AfterSalesTicket> query = context.AfterSalesTickets
                .AsNoTracking()
                .Include(t => t.OrderItem)
                .ThenInclude(oi => oi!.ProductVariant)
                .ThenInclude(pv => pv!.Product);

            if (request.Status.HasValue)
            {
                // When filtering by InProgress status, also include Replacing tickets awaiting replacement selection
                if (request.Status.Value == AfterSalesTicketStatus.InProgress)
                    query = query.Where(t => 
                        t.TicketStatus == AfterSalesTicketStatus.InProgress ||
                        (t.TicketStatus == AfterSalesTicketStatus.Replacing && t.IsAwaitingReplacement));
                else
                    query = query.Where(t => t.TicketStatus == request.Status.Value);
            }

            if (request.TicketType.HasValue)
                query = query.Where(t => t.TicketType == request.TicketType.Value);

            if (request.OrderId.HasValue)
                query = query.Where(t => t.OrderId == request.OrderId.Value);

            int totalCount = await query.CountAsync(cancellationToken);

            List<TicketListDto> items = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<TicketListDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

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

using Application.AfterSales.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Queries;

public sealed class GetMyTickets
{
    public sealed class Query : IRequest<Result<PagedResult<TicketListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Query, Result<PagedResult<TicketListDto>>>
    {
        public async Task<Result<PagedResult<TicketListDto>>> Handle(Query request, CancellationToken ct)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<TicketListDto>>.Failure("Invalid pagination parameters.", 400);

            Guid userId = userAccessor.GetUserId();

            IQueryable<AfterSalesTicket> query = context.AfterSalesTickets
                .AsNoTracking()
                .Where(t => t.CustomerId == userId);

            int totalCount = await query.CountAsync(ct);

            List<TicketListDto> items = await query
                .OrderByDescending(t => t.CreatedAt)
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

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

public sealed class GetMyTicketDetail
{
    public sealed class Query : IRequest<Result<TicketDetailDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Query, Result<TicketDetailDto>>
    {
        public async Task<Result<TicketDetailDto>> Handle(Query request, CancellationToken ct)
        {
            Guid userId = userAccessor.GetUserId();

            TicketDetailDto? dto = await context.AfterSalesTickets
                .AsNoTracking()
                .Where(t => t.Id == request.Id && t.CustomerId == userId)
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<TicketDetailDto>.Failure("Ticket not found.", 404);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

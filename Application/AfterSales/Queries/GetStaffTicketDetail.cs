using Application.AfterSales.DTOs;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Queries;

public sealed class GetStaffTicketDetail
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
                .Include(t => t.OrderItem)
                .ThenInclude(oi => oi!.ProductVariant)
                .ThenInclude(pv => pv!.Product)
                .Include(t => t.Attachments.Where(a => a.DeletedAt == null))
                .Include(t => t.Order)
                .ThenInclude(o => o!.Address)
                .Include(t => t.Order)
                .ThenInclude(o => o!.Prescription)
                .ThenInclude(p => p!.Details)
                .Where(t => t.Id == request.Id)
                .ProjectTo<TicketDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (dto == null)
                return Result<TicketDetailDto>.Failure("Ticket not found.", 404);

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

using Application.Core;
using Application.AfterSalesTickets.DTOs;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSalesTickets.Queries;

public sealed class GetTicketList
{
    public sealed class Query : IRequest<Result<PagedResult<AfterSalesTicketListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? CustomerEmail { get; set; }
        public AfterSalesTicketType? Type { get; set; }
        public AfterSalesTicketStatus? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public sealed class Handler(AppDbContext context) 
        : IRequestHandler<Query, Result<PagedResult<AfterSalesTicketListDto>>>
    {
        public async Task<Result<PagedResult<AfterSalesTicketListDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = context.AfterSalesTickets
                .Include(t => t.Order)
                    .ThenInclude(o => o.User)
                .AsQueryable();

            // Filter by customer email
            if (!string.IsNullOrWhiteSpace(request.CustomerEmail))
            {
                query = query.Where(t => t.Order.User != null && t.Order.User.Email != null &&
                    EF.Functions.Like(t.Order.User.Email, $"%{request.CustomerEmail}%"));
            }

            // Filter by ticket type
            if (request.Type.HasValue)
            {
                query = query.Where(t => t.TicketType == request.Type.Value);
            }

            // Filter by ticket status
            if (request.Status.HasValue)
            {
                query = query.Where(t => t.TicketStatus == request.Status.Value);
            }

            // Filter by date range
            if (request.FromDate.HasValue)
            {
                query = query.Where(t => t.CreatedAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                var toDateInclusive = request.ToDate.Value.AddDays(1);
                query = query.Where(t => t.CreatedAt < toDateInclusive);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var tickets = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var ticketDtos = tickets.Select(t => new AfterSalesTicketListDto
            {
                Id = t.Id,
                TicketNumber = $"TKT-{t.Id.ToString().Substring(0, 8).ToUpper()}",
                OrderId = t.OrderId,
                OrderNumber = $"ORD-{t.OrderId.ToString().Substring(0, 8).ToUpper()}",
                CustomerEmail = t.Order.User?.Email ?? "N/A",
                CustomerName = t.Order.User?.DisplayName ?? "Guest Customer",
                TicketType = t.TicketType,
                TicketStatus = t.TicketStatus,
                Reason = t.Reason,
                PolicyViolation = t.PolicyViolation,
                CreatedAt = t.CreatedAt,
                RefundAmount = t.RefundAmount
            }).ToList();

            var result = new PagedResult<AfterSalesTicketListDto>
            {
                Items = ticketDtos,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<AfterSalesTicketListDto>>.Success(result);
        }
    }
}

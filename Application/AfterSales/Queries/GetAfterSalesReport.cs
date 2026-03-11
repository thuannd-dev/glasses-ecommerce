using Application.AfterSales.DTOs;
using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Queries;

public sealed class GetAfterSalesReport
{
    public sealed class Query : IRequest<Result<AfterSalesReportDto>>
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<AfterSalesReportDto>>
    {
        public async Task<Result<AfterSalesReportDto>> Handle(Query request, CancellationToken ct)
        {
            if (request.FromDate.HasValue && request.ToDate.HasValue && request.FromDate.Value > request.ToDate.Value)
                return Result<AfterSalesReportDto>.Failure("FromDate cannot be later than ToDate.", 400);

            IQueryable<AfterSalesTicket> query = context.AfterSalesTickets.AsNoTracking();

            if (request.FromDate.HasValue)
                query = query.Where(t => t.CreatedAt >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(t => t.CreatedAt <= request.ToDate.Value);

            var byStatusRaw = await query
                .GroupBy(t => t.TicketStatus)
                .Select(g => new 
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync(ct);

            var byTypeRaw = await query
                .GroupBy(t => t.TicketType)
                .Select(g => new 
                {
                    TicketType = g.Key,
                    Count = g.Count(),
                    TotalRefundAmount = g.Sum(t => t.RefundAmount ?? 0)
                })
                .ToListAsync(ct);

            int totalTickets = byStatusRaw.Sum(x => x.Count);
            int openTickets = byStatusRaw
                .Where(x => x.Status == AfterSalesTicketStatus.Pending || 
                            x.Status == AfterSalesTicketStatus.InProgress)
                .Sum(x => x.Count);
            
            int resolved = byStatusRaw.Where(x => x.Status == AfterSalesTicketStatus.Resolved).Sum(x => x.Count);
            int rejected = byStatusRaw.Where(x => x.Status == AfterSalesTicketStatus.Rejected).Sum(x => x.Count);
            int closed = byStatusRaw.Where(x => x.Status == AfterSalesTicketStatus.Closed).Sum(x => x.Count);
            
            int resolutionDenominator = resolved + rejected + closed;
            double resolutionRate = resolutionDenominator == 0 
                ? 0 
                : (double)(resolved + closed) / resolutionDenominator;

            List<AfterSalesByTypeDto> byType = byTypeRaw
                .Select(x => new AfterSalesByTypeDto
                {
                    TicketType = x.TicketType.ToString(),
                    Count = x.Count,
                    TotalRefundAmount = x.TotalRefundAmount
                })
                .ToList();

            List<AfterSalesByStatusDto> byStatus = byStatusRaw
                .Select(x => new AfterSalesByStatusDto
                {
                    Status = x.Status.ToString(),
                    Count = x.Count
                })
                .ToList();

            AfterSalesReportDto result = new()
            {
                TotalTickets = totalTickets,
                OpenTickets = openTickets,
                ResolutionRate = Math.Round(resolutionRate * 100, 2), // As percentage
                ByType = byType,
                ByStatus = byStatus
            };

            return Result<AfterSalesReportDto>.Success(result);
        }
    }
}

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
            IQueryable<AfterSalesTicket> query = context.AfterSalesTickets.AsNoTracking();

            if (request.FromDate.HasValue)
                query = query.Where(t => t.CreatedAt >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(t => t.CreatedAt <= request.ToDate.Value);

            int totalTickets = await query.CountAsync(ct);
            int openTickets = await query.CountAsync(t => 
                t.TicketStatus == AfterSalesTicketStatus.Pending || 
                t.TicketStatus == AfterSalesTicketStatus.InProgress, ct);
            
            int resolved = await query.CountAsync(t => t.TicketStatus == AfterSalesTicketStatus.Resolved, ct);
            int rejected = await query.CountAsync(t => t.TicketStatus == AfterSalesTicketStatus.Rejected, ct);
            int resolutionDenominator = resolved + rejected;
            double resolutionRate = resolutionDenominator == 0 
                ? 0 
                : (double)resolved / resolutionDenominator;

            List<AfterSalesByTypeDto> byType = await query
                .GroupBy(t => t.TicketType)
                .Select(g => new AfterSalesByTypeDto
                {
                    TicketType = g.Key.ToString(),
                    Count = g.Count(),
                    TotalRefundAmount = g.Sum(t => t.RefundAmount ?? 0)
                })
                .ToListAsync(ct);

            List<AfterSalesByStatusDto> byStatus = await query
                .GroupBy(t => t.TicketStatus)
                .Select(g => new AfterSalesByStatusDto
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync(ct);

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

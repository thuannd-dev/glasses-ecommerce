using Application.Core;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

//Báo cáo doanh thu — filter theo OrderSource và khoảng thời gian
public sealed class GetRevenueReport
{
    public sealed class Query : IRequest<Result<RevenueReportDto>>
    {
        public OrderSource? Source { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<RevenueReportDto>>
    {
        public async Task<Result<RevenueReportDto>> Handle(Query request, CancellationToken ct)
        {
            var from = request.FromDate ?? DateTime.UtcNow.AddMonths(-1);
            var to = request.ToDate ?? DateTime.UtcNow;

            var query = context.Orders
                .AsNoTracking()
                .Where(o => o.CreatedAt >= from && o.CreatedAt <= to);

            if (request.Source.HasValue && request.Source.Value != OrderSource.Unknown)
                query = query.Where(o => o.OrderSource == request.Source.Value);

            // Aggregate by source
            var bySource = await query
                .GroupBy(o => o.OrderSource)
                .Select(g => new
                {
                    Source = g.Key,
                    OrderCount = g.Count(),
                    CompletedCount = g.Count(o => o.OrderStatus == OrderStatus.Completed),
                    CancelledCount = g.Count(o => o.OrderStatus == OrderStatus.Cancelled),
                    Revenue = g.Where(o => o.OrderStatus == OrderStatus.Completed)
                        .Sum(o => o.TotalAmount + o.ShippingFee),
                    Discount = g.Where(o => o.OrderStatus == OrderStatus.Completed)
                        .SelectMany(o => o.PromoUsageLogs)
                        .Sum(p => p.DiscountApplied),
                })
                .ToListAsync(ct);

            var result = new RevenueReportDto
            {
                OrderSource = request.Source.HasValue && request.Source.Value != OrderSource.Unknown
                    ? request.Source.Value.ToString()
                    : "All",
                FromDate = from,
                ToDate = to,
                TotalOrders = bySource.Sum(s => s.OrderCount),
                CompletedOrders = bySource.Sum(s => s.CompletedCount),
                CancelledOrders = bySource.Sum(s => s.CancelledCount),
                TotalRevenue = bySource.Sum(s => s.Revenue),
                TotalDiscount = bySource.Sum(s => s.Discount),
                NetRevenue = bySource.Sum(s => s.Revenue - s.Discount),
                BySource = [.. bySource.Select(s => new RevenueBySourceDto
                {
                    Source = s.Source.ToString(),
                    OrderCount = s.CompletedCount,
                    Revenue = s.Revenue,
                    Discount = s.Discount,
                    NetRevenue = s.Revenue - s.Discount,
                })],
            };

            return Result<RevenueReportDto>.Success(result);
        }
    }
}

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
            DateTime from = request.FromDate ?? DateTime.UtcNow.AddMonths(-1);
            DateTime to = request.ToDate ?? DateTime.UtcNow;

            IQueryable<Order> query = context.Orders
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
                    CompletedCount = g.Count(o =>
                        o.OrderStatus == OrderStatus.Delivered ||
                        o.OrderStatus == OrderStatus.Completed ||
                        o.OrderStatus == OrderStatus.Refunded),
                    CancelledCount = g.Count(o => o.OrderStatus == OrderStatus.Cancelled),
                    Revenue = g.Where(o =>
                            o.OrderStatus == OrderStatus.Delivered ||
                            o.OrderStatus == OrderStatus.Completed ||
                            o.OrderStatus == OrderStatus.Refunded)
                        .Select(o => (decimal?)(o.TotalAmount + o.ShippingFee))
                        .Sum() ?? 0m,
                    Discount = g.Where(o =>
                            o.OrderStatus == OrderStatus.Delivered ||
                            o.OrderStatus == OrderStatus.Completed ||
                            o.OrderStatus == OrderStatus.Refunded)
                        .SelectMany(o => o.PromoUsageLogs)
                        .Select(p => (decimal?)p.DiscountApplied)
                        .Sum() ?? 0m,
                    RefundAmount = g.Where(o =>
                            o.OrderStatus == OrderStatus.Delivered ||
                            o.OrderStatus == OrderStatus.Completed ||
                            o.OrderStatus == OrderStatus.Refunded)
                        .SelectMany(o => o.Payments)
                        .SelectMany(p => p.Refunds)
                        .Where(r => r.RefundStatus == RefundStatus.Completed)
                        .Select(r => (decimal?)r.Amount)
                        .Sum() ?? 0m,
                })
                .ToListAsync(ct);

            RevenueReportDto result = new RevenueReportDto
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
                TotalRefund = bySource.Sum(s => s.RefundAmount),
                NetRevenue = bySource.Sum(s => s.Revenue - s.Discount - s.RefundAmount),
                BySource = [.. bySource.Select(s => new RevenueBySourceDto
                {
                    Source = s.Source.ToString(),
                    OrderCount = s.OrderCount,
                    Revenue = s.Revenue,
                    Discount = s.Discount,
                    TotalRefund = s.RefundAmount,
                    NetRevenue = s.Revenue - s.Discount - s.RefundAmount,
                })],
            };

            return Result<RevenueReportDto>.Success(result);
        }
    }
}

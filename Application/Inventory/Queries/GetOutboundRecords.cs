using Application.Core;
using Application.Inventory.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Inventory.Queries;

public sealed class GetOutboundRecords
{
    public sealed class Query : IRequest<Result<PagedResult<OutboundRecordListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public Guid? OrderId { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<PagedResult<OutboundRecordListDto>>>
    {
        public async Task<Result<PagedResult<OutboundRecordListDto>>> Handle(Query request, CancellationToken ct)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<OutboundRecordListDto>>
                    .Failure("Invalid pagination parameters.", 400);

            IQueryable<InventoryTransaction> txnQuery = context.InventoryTransactions
                .AsNoTracking()
                .Where(t => t.TransactionType == TransactionType.Outbound && t.ReferenceType == ReferenceType.Order);

            if (request.OrderId.HasValue && request.OrderId.Value == Guid.Empty)
                return Result<PagedResult<OutboundRecordListDto>>
                    .Failure("Invalid orderId.", 400);

            if (request.OrderId.HasValue)
                txnQuery = txnQuery.Where(t => t.ReferenceId == request.OrderId.Value);

            // Group by OrderId (ReferenceId) first to avoid correlated subqueries
            var query = txnQuery
                .Where(t => t.ReferenceId.HasValue)
                .GroupBy(t => t.ReferenceId!.Value)
                .Select(g => new
                {
                    OrderId = g.Key,
                    TotalItems = g.Count(),
                    TotalQuantity = g.Sum(x => x.Quantity),
                    RecordedAt = g.Min(x => x.CreatedAt),
                    RecordedByName = g.Where(x => x.Creator != null)
                                      .OrderBy(x => x.CreatedAt)
                                      .ThenBy(x => x.Id)
                                      .Select(x => x.Creator!.DisplayName)
                                      .FirstOrDefault()
                });

            int totalCount = await query.CountAsync(ct);

            // Fetch the aggregated transaction data
            var pagedTxnStats = await query
                .OrderByDescending(x => x.RecordedAt) // Order by the time it was recorded
                .ThenByDescending(x => x.OrderId) // deterministic sort
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(ct);

            // If no data, return empty early
            if (pagedTxnStats.Count == 0)
            {
                return Result<PagedResult<OutboundRecordListDto>>.Success(new PagedResult<OutboundRecordListDto>
                {
                    Items = [],
                    TotalCount = totalCount,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize
                });
            }

            List<Guid> orderIds = pagedTxnStats.Select(x => x.OrderId).ToList();

            // Fetch order details in a single query
            var orderDetails = await context.Orders
                .AsNoTracking()
                .Where(o => orderIds.Contains(o.Id))
                .Select(o => new
                {
                    o.Id,
                    o.OrderStatus,
                    CustomerName = o.Address != null && !string.IsNullOrWhiteSpace(o.Address.RecipientName)
                        ? o.Address.RecipientName
                        : o.WalkInCustomerName
                })
                .ToDictionaryAsync(o => o.Id, ct);

            // Combine the data in memory
            List<OutboundRecordListDto> items = pagedTxnStats.Select(stat =>
            {
                var order = orderDetails.GetValueOrDefault(stat.OrderId);
                return new OutboundRecordListDto
                {
                    OrderId = stat.OrderId,
                    OrderNumber = "ORD-" + stat.OrderId.ToString().Substring(0, 8).ToUpper(),
                    OrderStatus = order?.OrderStatus.ToString(),
                    CustomerName = order?.CustomerName,
                    TotalItems = stat.TotalItems,
                    TotalQuantity = stat.TotalQuantity,
                    RecordedAt = stat.RecordedAt,
                    RecordedByName = stat.RecordedByName
                };
            }).ToList();

            PagedResult<OutboundRecordListDto> result = new()
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<OutboundRecordListDto>>.Success(result);
        }
    }
}

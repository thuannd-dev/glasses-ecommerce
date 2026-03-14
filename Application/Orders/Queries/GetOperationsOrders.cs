using Application.Core;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetOperationsOrders
{
    public sealed class Query : IRequest<Result<PagedResult<StaffOrderListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public OrderStatus? Status { get; set; }
        public OrderType? OrderType { get; set; }
        public OrderSource? OrderSource { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<PagedResult<StaffOrderListDto>>>
    {
        public async Task<Result<PagedResult<StaffOrderListDto>>> Handle(Query request, CancellationToken ct)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<StaffOrderListDto>>
                    .Failure("Invalid pagination parameters.", 400);

            IQueryable<Order> query = context.Orders.AsNoTracking();

            if (request.Status.HasValue)
                query = query.Where(o => o.OrderStatus == request.Status.Value);

            if (request.OrderType.HasValue)
                query = query.Where(o => o.OrderType == request.OrderType.Value);

            if (request.OrderSource.HasValue)
                query = query.Where(o => o.OrderSource == request.OrderSource.Value);

            int totalCount = await query.CountAsync(ct);

            // Pre-compute on the app side — DateTime.ToString("O") cannot be translated to SQL.
            string expectedStockDate = DateTime.UtcNow.AddDays(14).ToString("O");

            // Project directly to DTO in SQL — no full entity load, no cartesian-product joins.
            // Prescriptions.Any() → EXISTS subquery (much cheaper than Include + load all rows).
            List<StaffOrderListDto> mappedOrders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(o => new StaffOrderListDto
                {
                    Id = o.Id,
                    OrderNumber = "ORD-" + o.Id.ToString().Substring(0, 8).ToUpper(),
                    OrderSource = o.OrderSource.ToString(),
                    OrderType = o.OrderType.ToString(),
                    OrderStatus = o.OrderStatus.ToString(),
                    TotalAmount = o.TotalAmount,
                    FinalAmount = o.TotalAmount + o.ShippingFee - o.PromoUsageLogs.Sum(p => p.DiscountApplied),
                    WalkInCustomerName = o.WalkInCustomerName,
                    WalkInCustomerPhone = o.WalkInCustomerPhone,
                    CustomerName = o.Address != null ? o.Address.RecipientName : o.WalkInCustomerName,
                    CustomerPhone = o.Address != null ? o.Address.RecipientPhone : o.WalkInCustomerPhone,
                    CustomerEmail = o.User != null ? o.User.Email : null,
                    ShippingAddress = o.Address != null
                        ? $"{o.Address.Venue}, {o.Address.Ward}, {o.Address.District}, {o.Address.City}"
                        : null,
                    CreatedBySalesStaff = o.CreatedBySalesStaff,
                    SalesStaffName = o.SalesStaff != null ? o.SalesStaff.DisplayName : null,
                    ItemCount = o.OrderItems.Count,
                    CreatedAt = o.CreatedAt,
                    ExpectedStockDate = o.OrderType == OrderType.PreOrder ? expectedStockDate : null,
                    PrescriptionStatus = o.Prescriptions.Any() ? "lens_ordered" : null,
                    ShipmentId = o.ShipmentInfo != null ? o.ShipmentInfo.Id : (Guid?)null,
                    TrackingNumber = o.ShipmentInfo != null ? o.ShipmentInfo.TrackingCode : null,
                    Carrier = o.ShipmentInfo != null ? o.ShipmentInfo.CarrierName.ToString() : null,
                    Items = o.OrderItems.Select(oi => new StaffOrderItemDto
                    {
                        Id = oi.Id,
                        ProductVariantId = oi.ProductVariantId,
                        ProductName = oi.ProductVariant != null && oi.ProductVariant.Product != null
                            ? oi.ProductVariant.Product.ProductName
                            : "Unknown",
                        Sku = oi.ProductVariant != null ? oi.ProductVariant.SKU : "N/A",
                        Quantity = oi.Quantity,
                        Price = oi.UnitPrice,
                        PrescriptionId = oi.PrescriptionId == null ? null : oi.PrescriptionId.Value.ToString()
                    }).ToList()
                })
                .ToListAsync(ct);

            PagedResult<StaffOrderListDto> result = new()
            {
                Items = mappedOrders,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<StaffOrderListDto>>.Success(result);
        }
    }
}

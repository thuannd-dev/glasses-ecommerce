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

            // Pre-compute expected stock date on the app side — cannot be translated to SQL.
            string expectedStockDate = DateTime.UtcNow.AddDays(14).ToString("O");
            // 1. Server-Side Projection (Select only required columns)
            // This prevents fetching unnecessary columns and limits DB payload using SQL,
            // while taking advantage of AsSplitQuery() for related collections.
            var rawOrders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(o => new
                {
                    o.Id,
                    o.OrderSource,
                    o.OrderType,
                    o.OrderStatus,
                    o.TotalAmount,
                    o.ShippingFee,
                    DiscountApplied = o.PromoUsageLogs.Sum(p => p.DiscountApplied),
                    o.WalkInCustomerName,
                    o.WalkInCustomerPhone,
                    AddressVenue = o.Address != null ? o.Address.Venue : null,
                    AddressWard = o.Address != null ? o.Address.Ward : null,
                    AddressDistrict = o.Address != null ? o.Address.District : null,
                    AddressProvince = o.Address != null ? o.Address.Province : null,
                    RecipientName = o.Address != null ? o.Address.RecipientName : null,
                    RecipientPhone = o.Address != null ? o.Address.RecipientPhone : null,
                    UserEmail = o.User != null ? o.User.Email : null,
                    o.CreatedBySalesStaff,
                    SalesStaffName = o.SalesStaff != null ? o.SalesStaff.DisplayName : null,
                    o.CreatedAt,
                    HasPrescriptions = o.Prescriptions.Any(),
                    ShipmentId = o.ShipmentInfo != null ? o.ShipmentInfo.Id : (Guid?)null,
                    TrackingCode = o.ShipmentInfo != null ? o.ShipmentInfo.TrackingCode : null,
                    o.ShipmentInfo, // Easiest way to safely capture Enum CarrierName if not null
                    Items = o.OrderItems.Select(oi => new
                    {
                        oi.Id,
                        oi.ProductVariantId,
                        ProductName = oi.ProductVariant != null && oi.ProductVariant.Product != null ? oi.ProductVariant.Product.ProductName : "Unknown",
                        Sku = oi.ProductVariant != null ? oi.ProductVariant.SKU : "N/A",
                        oi.Quantity,
                        oi.UnitPrice,
                        oi.PrescriptionId
                    }),
                    Prescriptions = o.Prescriptions.Select(p => new
                    {
                        p.Id,
                        p.IsVerified,
                        p.VerifiedAt,
                        p.VerificationNotes,
                        Details = p.Details.Select(d => new
                        {
                            d.Id,
                            d.Eye,
                            d.SPH,
                            d.CYL,
                            d.AXIS,
                            d.PD,
                            d.ADD
                        })
                    })
                })
                .AsSplitQuery()
                .ToListAsync(ct);

            // 2. In-Memory DTO Construction
            // We map the raw dataset to StaffOrderListDto in memory since EF Core struggles
            // with complex scalar String manipulations (e.g. Substring, ToUpperInvariant) and Enum.ToString() mapping.
            List<StaffOrderListDto> mappedOrders = [.. rawOrders.Select(o => new StaffOrderListDto
            {
                Id = o.Id,
                OrderNumber = "ORD-" + o.Id.ToString().Substring(0, 8).ToUpperInvariant(),
                OrderSource = o.OrderSource.ToString(),
                OrderType = o.OrderType.ToString(),
                OrderStatus = o.OrderStatus.ToString(),
                TotalAmount = o.TotalAmount,
                FinalAmount = o.TotalAmount + o.ShippingFee - o.DiscountApplied,
                WalkInCustomerName = o.WalkInCustomerName,
                WalkInCustomerPhone = o.WalkInCustomerPhone,
                CustomerName = o.RecipientName ?? o.WalkInCustomerName,
                CustomerPhone = o.RecipientPhone ?? o.WalkInCustomerPhone,
                CustomerEmail = o.UserEmail,
                ShippingAddress = o.AddressVenue != null
                    ? $"{o.AddressVenue}, {o.AddressWard}, {o.AddressDistrict}, {o.AddressProvince}"
                    : null,
                CreatedBySalesStaff = o.CreatedBySalesStaff,
                SalesStaffName = o.SalesStaffName,
                ItemCount = o.Items.Count(),
                CreatedAt = o.CreatedAt,
                ExpectedStockDate = o.OrderType == OrderType.PreOrder ? expectedStockDate : null,
                PrescriptionStatus = o.HasPrescriptions ? "lens_ordered" : null,
                ShipmentId = o.ShipmentId,
                TrackingNumber = o.TrackingCode,
                Carrier = o.ShipmentInfo != null ? o.ShipmentInfo.CarrierName.ToString() : null,
                Items = [.. o.Items.Select(oi => new StaffOrderItemDto
                {
                    Id = oi.Id,
                    ProductVariantId = oi.ProductVariantId,
                    ProductName = oi.ProductName,
                    Sku = oi.Sku,
                    Quantity = oi.Quantity,
                    Price = oi.UnitPrice,
                    PrescriptionId = oi.PrescriptionId?.ToString()
                })],
                Prescriptions = [.. o.Prescriptions.Select(p => new OrderPrescriptionDto
                {
                    Id = p.Id,
                    IsVerified = p.IsVerified,
                    VerifiedAt = p.VerifiedAt,
                    VerificationNotes = p.VerificationNotes,
                    Details = [.. p.Details.Select(d => new PrescriptionDetailOutputDto
                    {
                        Id = d.Id,
                        Eye = d.Eye.ToString(),
                        SPH = d.SPH,
                        CYL = d.CYL,
                        AXIS = d.AXIS,
                        PD = d.PD,
                        ADD = d.ADD,
                    })]
                })]
            })];

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

using Application.Core;
using Application.Orders.DTOs;
using AutoMapper;
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

    internal sealed class Handler(AppDbContext context, IMapper mapper)
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

            // Load orders with related data
            List<Order> orders = await query
                .AsNoTracking()
                .Include(o => o.Address)
                .Include(o => o.User)
                .Include(o => o.SalesStaff)
                .Include(o => o.ShipmentInfo)
                .Include(o => o.Prescription)
                .Include(o => o.OrderItems!)
                    .ThenInclude(oi => oi.ProductVariant!)
                    .ThenInclude(pv => pv.Product)
                .OrderByDescending(o => o.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(ct);

            // Map to DTOs with items populated
            List<StaffOrderListDto> mappedOrders = new();
            foreach (Order order in orders)
            {
                StaffOrderListDto dto = mapper.Map<Order, StaffOrderListDto>(order);
                
                // Set ExpectedStockDate for pre-orders
                if (order.OrderType == OrderType.PreOrder)
                    dto.ExpectedStockDate = DateTime.UtcNow.AddDays(14).ToString("O");
                
                // Set PrescriptionStatus for prescriptions
                if (order.Prescription != null)
                    dto.PrescriptionStatus = "lens_ordered";
                
                // Set ShipmentInfo details
                if (order.ShipmentInfo != null)
                {
                    dto.ShipmentId = order.ShipmentInfo.Id;
                    dto.TrackingNumber = order.ShipmentInfo.TrackingCode;
                    dto.Carrier = order.ShipmentInfo.CarrierName.ToString();
                }
                
                dto.Items = order.OrderItems.Select(oi => new StaffOrderItemDto
                {
                    Id = oi.Id,
                    ProductVariantId = oi.ProductVariantId,
                    ProductName = oi.ProductVariant?.Product?.ProductName ?? "Unknown",
                    Sku = oi.ProductVariant?.SKU ?? "N/A",
                    Quantity = oi.Quantity,
                    Price = oi.UnitPrice,
                    PrescriptionId = null
                }).ToList();
                mappedOrders.Add(dto);
            }

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

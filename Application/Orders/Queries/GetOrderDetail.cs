using Application.Core;
using Application.Orders.DTOs;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetOrderDetail
{
    public sealed class Query : IRequest<Result<OrderDetailDto>>
    {
        public required Guid OrderId { get; set; }
    }

    public sealed class Handler(AppDbContext context) 
        : IRequestHandler<Query, Result<OrderDetailDto>>
    {
        public async Task<Result<OrderDetailDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var order = await context.Orders
                .Include(o => o.User)
                .Include(o => o.Address)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv.Product)
                .Include(o => o.Prescription)
                    .ThenInclude(p => p!.Details)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

            if (order == null)
            {
                return Result<OrderDetailDto>.Failure("Order not found", 404);
            }

            var addressDto = new AddressDto
            {
                RecipientName = order.Address.RecipientName,
                RecipientPhone = order.Address.RecipientPhone,
                Venue = order.Address.Venue,
                Ward = order.Address.Ward,
                District = order.Address.District,
                City = order.Address.City,
                PostalCode = order.Address.PostalCode
            };

            var orderItems = order.OrderItems.Select(oi => new OrderItemDetailDto
            {
                Id = oi.Id,
                OrderItemId = oi.Id,
                ProductName = oi.ProductVariant.Product.ProductName,
                GlassModel = oi.ProductVariant.VariantName ?? "Standard",
                LensType = oi.ProductVariant.VariantName ?? "Standard",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            }).ToList();

            var prescriptionDto = order.Prescription != null ? new PrescriptionDto
            {
                Id = order.Prescription.Id,
                IsVerified = order.Prescription.IsVerified,
                Details = order.Prescription.Details.Select(d => new PrescriptionDetailDto
                {
                    Eye = d.Eye,
                    SPH = d.SPH,
                    CYL = d.CYL,
                    AXIS = d.AXIS,
                    PD = d.PD,
                    ADD = d.ADD
                }).ToList()
            } : null;

            var orderDetailDto = new OrderDetailDto
            {
                Id = order.Id,
                OrderNumber = $"ORD-{order.Id.ToString().Substring(0, 8).ToUpper()}",
                CustomerEmail = order.User?.Email ?? "N/A",
                CustomerName = order.User?.DisplayName ?? "Guest Customer",
                CustomerPhone = order.Address.RecipientPhone,
                ShippingAddress = addressDto,
                TotalAmount = order.TotalAmount,
                ShippingFee = order.ShippingFee,
                OrderType = order.OrderType,
                OrderStatus = order.OrderStatus,
                OrderSource = order.OrderSource,
                CustomerNote = order.CustomerNote,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                OrderItems = orderItems,
                Prescription = prescriptionDto
            };

            return Result<OrderDetailDto>.Success(orderDetailDto);
        }
    }
}

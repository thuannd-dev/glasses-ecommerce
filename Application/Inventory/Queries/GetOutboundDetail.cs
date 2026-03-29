using Application.Core;
using Application.Inventory.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Inventory.Queries;

public sealed class GetOutboundDetail
{
    public sealed class Query : IRequest<Result<OutboundRecordDto>>
    {
        public required Guid OrderId { get; set; }
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<OutboundRecordDto>>
    {
        public async Task<Result<OutboundRecordDto>> Handle(Query request, CancellationToken ct)
        {
            if (request.OrderId == Guid.Empty)
                return Result<OutboundRecordDto>.Failure("Invalid orderId.", 400);

            // 1. Retrieve order details
            var orderInfo = await context.Orders
                .AsNoTracking()
                .Where(o => o.Id == request.OrderId)
                .Select(o => new
                {
                    o.Id,
                    o.OrderStatus,
                    o.WalkInCustomerName,
                    RecipientName = o.Address != null ? o.Address.RecipientName : null
                })
                .FirstOrDefaultAsync(ct);

            if (orderInfo == null)
            {
                return Result<OutboundRecordDto>.Failure("Order not found.", 404);
            }

            // 2. Lấy danh sách inventory transactions (outbound) của order này
            // Sử dụng Select để EF Core chỉ truy vấn đúng các cột cần thiết (tránh SELECT * toàn bộ ProductVariant và User)
            var txns = await context.InventoryTransactions
                .AsNoTracking()
                .Where(t => t.ReferenceId == request.OrderId &&
                            t.TransactionType == TransactionType.Outbound &&
                            t.ReferenceType == ReferenceType.Order)
                .OrderBy(t => t.CreatedAt)
                .Select(t => new
                {
                    TransactionId = t.Id,
                    ProductVariantId = t.ProductVariantId,
                    ProductId = t.ProductVariant != null ? t.ProductVariant.ProductId : (Guid?)null,
                    ProductName = t.ProductVariant != null && t.ProductVariant.Product != null
                        ? t.ProductVariant.Product.ProductName
                        : null,
                    VariantName = t.ProductVariant.VariantName,
                    SKU = t.ProductVariant.SKU,
                    VariantFirstImage = t.ProductVariant != null
                        ? t.ProductVariant.Images
                            .Where(img => !img.IsDeleted)
                            .OrderBy(img => img.DisplayOrder)
                            .Select(img => new
                            {
                                img.ImageUrl,
                                img.AltText
                            })
                            .FirstOrDefault()
                        : null,
                    ProductFirstImage = t.ProductVariant != null && t.ProductVariant.Product != null
                        ? t.ProductVariant.Product.Images
                            .Where(img => !img.IsDeleted && img.ProductId != null)
                            .OrderBy(img => img.DisplayOrder)
                            .Select(img => new
                            {
                                img.ImageUrl,
                                img.AltText
                            })
                            .FirstOrDefault()
                        : null,
                    Quantity = t.Quantity,
                    Notes = t.Notes,
                    CreatedAt = t.CreatedAt,
                    CreatorName = t.Creator != null ? t.Creator.DisplayName : null
                })
                .ToListAsync(ct);

            if (txns.Count == 0)
            {
                return Result<OutboundRecordDto>.Failure("No outbound record found for this order.", 404);
            }

            // Chọn transaction sớm nhất theo CreatedAt (và TransactionId để cố định thứ tự khi trùng thời gian)
            var earliestTxn = txns
                .OrderBy(t => t.CreatedAt)
                .ThenBy(t => t.TransactionId)
                .First();


            // 3. Assemble DTO
            var dto = new OutboundRecordDto
            {
                OrderId = orderInfo.Id,
                OrderNumber = "ORD-" + orderInfo.Id.ToString().Substring(0, 8).ToUpper(),
                OrderStatus = orderInfo.OrderStatus.ToString(),
                CustomerName = !string.IsNullOrWhiteSpace(orderInfo.RecipientName)
                                    ? orderInfo.RecipientName
                                    : orderInfo.WalkInCustomerName,
                TotalItems = txns.Count,
                TotalQuantity = txns.Sum(t => t.Quantity),
                RecordedAt = earliestTxn.CreatedAt,
                RecordedByName = earliestTxn.CreatorName,
                Items = txns.Select(t => new OutboundRecordItemDto
                {
                    TransactionId = t.TransactionId,
                    ProductVariantId = t.ProductVariantId,
                    ProductId = t.ProductId,
                    ProductName = t.ProductName,
                    VariantName = t.VariantName,
                    SKU = t.SKU,
                    ProductImageUrl = t.VariantFirstImage != null
                        ? t.VariantFirstImage.ImageUrl
                        : (t.ProductFirstImage != null ? t.ProductFirstImage.ImageUrl : null),
                    ProductImageAlt = t.VariantFirstImage != null
                        ? t.VariantFirstImage.AltText
                        : (t.ProductFirstImage != null ? t.ProductFirstImage.AltText : null),
                    Quantity = t.Quantity,
                    Notes = t.Notes
                }).ToList()
            };

            return Result<OutboundRecordDto>.Success(dto);
        }
    }
}

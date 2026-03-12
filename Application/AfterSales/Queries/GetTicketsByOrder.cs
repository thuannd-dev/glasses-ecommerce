using Application.AfterSales.DTOs;
using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AfterSales.Queries;

public sealed class GetTicketsByOrder
{
    public sealed class Query : IRequest<Result<List<TicketWithItemsDto>>>
    {
        public required Guid OrderId { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IUserAccessor userAccessor) : IRequestHandler<Query, Result<List<TicketWithItemsDto>>>
    {
        public async Task<Result<List<TicketWithItemsDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            Guid userId = userAccessor.GetUserId();

            // Validate order exists and belongs to current user
            bool orderExists = await context.Orders
                .AsNoTracking()
                .AnyAsync(o => o.Id == request.OrderId && o.UserId == userId, cancellationToken);

            if (!orderExists)
                return Result<List<TicketWithItemsDto>>.Failure("Order not found.", 404);

            // Get all tickets for this order with their items
            List<TicketWithItemsDto> tickets = await context.AfterSalesTickets
                .AsNoTracking()
                .Where(t => t.OrderId == request.OrderId && t.CustomerId == userId)
                .Select(t => new TicketWithItemsDto
                {
                    Id = t.Id,
                    OrderId = t.OrderId,
                    OrderItemId = t.OrderItemId,
                    TicketType = t.TicketType,
                    OriginalTicketType = t.OriginalTicketType,
                    TicketStatus = t.TicketStatus,
                    ResolutionType = t.ResolutionType,
                    Reason = t.Reason,
                    RequestedAction = t.RequestedAction,
                    RefundAmount = t.RefundAmount,
                    IsRequiredEvidence = t.IsRequiredEvidence,
                    PolicyViolation = t.PolicyViolation,
                    StaffNotes = t.StaffNotes,
                    AssignedTo = t.AssignedTo,
                    CreatedAt = t.CreatedAt,
                    ReceivedAt = t.ReceivedAt,
                    ResolvedAt = t.ResolvedAt,
                    Attachments = t.Attachments
                        .Where(a => a.DeletedAt == null)
                        .OrderBy(a => a.CreatedAt)
                        .Select(a => new TicketAttachmentDto
                        {
                            Id = a.Id,
                            FileName = a.FileName,
                            FileUrl = a.FileUrl,
                            FileExtension = a.FileExtension,
                            CreatedAt = a.CreatedAt
                        })
                        .ToList(),
                    Items = t.OrderItemId.HasValue
                        ? context.OrderItems
                            .Where(oi => oi.Id == t.OrderItemId)
                            .Select(oi => new OrderItemOutputDto
                            {
                                Id = oi.Id,
                                ProductVariantId = oi.ProductVariantId,
                                Sku = oi.ProductVariant.SKU,
                                VariantName = oi.ProductVariant.VariantName,
                                ProductName = oi.ProductVariant.Product.ProductName,
                                Quantity = oi.Quantity,
                                UnitPrice = oi.UnitPrice,
                                TotalPrice = oi.Quantity * oi.UnitPrice,
                                ProductImageUrl = oi.ProductVariant.Product.Images
                                    .OrderBy(pi => pi.DisplayOrder)
                                    .Select(pi => pi.ImageUrl)
                                    .FirstOrDefault()
                            })
                            .ToList()
                        : context.OrderItems
                            .Where(oi => oi.OrderId == request.OrderId)
                            .Select(oi => new OrderItemOutputDto
                            {
                                Id = oi.Id,
                                ProductVariantId = oi.ProductVariantId,
                                Sku = oi.ProductVariant.SKU,
                                VariantName = oi.ProductVariant.VariantName,
                                ProductName = oi.ProductVariant.Product.ProductName,
                                Quantity = oi.Quantity,
                                UnitPrice = oi.UnitPrice,
                                TotalPrice = oi.Quantity * oi.UnitPrice,
                                ProductImageUrl = oi.ProductVariant.Product.Images
                                    .OrderBy(pi => pi.DisplayOrder)
                                    .Select(pi => pi.ImageUrl)
                                    .FirstOrDefault()
                            })
                            .ToList()
                })
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync(cancellationToken);

            return Result<List<TicketWithItemsDto>>.Success(tickets);
        }
    }
}

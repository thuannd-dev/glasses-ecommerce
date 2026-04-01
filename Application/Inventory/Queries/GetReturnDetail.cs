using Application.AfterSales.DTOs;
using Application.Core;
using Application.Inventory.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Inventory.Queries;

public sealed class GetReturnDetail
{
    public sealed class Query : IRequest<Result<ReturnDetailDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<ReturnDetailDto>>
    {
        public async Task<Result<ReturnDetailDto>> Handle(Query request, CancellationToken ct)
        {
            if (request.Id == Guid.Empty)
                return Result<ReturnDetailDto>.Failure("Invalid return id.", 400);

            // Try to find InboundRecord first using ProjectTo
            InboundRecordDto? inboundDto = await context.InboundRecords
                .AsNoTracking()
                .Where(ir => ir.Id == request.Id)
                .ProjectTo<InboundRecordDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (inboundDto != null)
                return Result<ReturnDetailDto>.Success(MapInboundDtoToReturnDetail(inboundDto));

            // Try to find AfterSalesTicket - load full entity for AfterMap callback
            AfterSalesTicket? ticket = await context.AfterSalesTickets
                .AsNoTracking()
                .Include(t => t.Order)
                .ThenInclude(o => o.Address)
                .Where(t => t.Id == request.Id)
                .FirstOrDefaultAsync(ct);

            if (ticket != null)
            {
                // Load Order.OrderItems separately with navigation properties
                if (ticket.Order != null)
                {
                    List<OrderItem> orderItems = await context.OrderItems
                        .AsNoTracking()
                        .Where(oi => oi.OrderId == ticket.Order.Id)
                        .Include(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv.Product)
                        .ThenInclude(p => p.Images)
                        .ToListAsync(ct);

                    ticket.Order.OrderItems = orderItems;
                }

                // Load OrderItem separately if ticket is for specific item
                if (ticket.OrderItemId.HasValue)
                {
                    OrderItem? orderItem = await context.OrderItems
                        .AsNoTracking()
                        .Where(oi => oi.Id == ticket.OrderItemId)
                        .Include(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv.Product)
                        .ThenInclude(p => p.Images)
                        .FirstOrDefaultAsync(ct);

                    if (orderItem != null)
                        ticket.OrderItem = orderItem;
                }

                TicketDetailDto ticketDto = mapper.Map<TicketDetailDto>(ticket);
                return Result<ReturnDetailDto>.Success(MapTicketDtoToReturnDetail(ticketDto));
            }

            // Not found
            return Result<ReturnDetailDto>.Failure("Return record not found.", 404);
        }

        private ReturnDetailDto MapInboundDtoToReturnDetail(InboundRecordDto inbound)
        {
            return new ReturnDetailDto
            {
                Id = inbound.Id,
                ReturnSourceType = "InboundRecord",
                Status = inbound.Status,
                CreatedAt = inbound.CreatedAt,
                CreatedByName = inbound.CreatedByName,
                Items = inbound.Items?.Select(item => new ReturnItemDetailDto
                {
                    Id = item.Id,
                    ProductName = item.ProductName,
                    VariantName = item.VariantName,
                    Sku = item.SKU,
                    Quantity = item.Quantity,
                    ProductImageUrl = item.ProductImageUrl,
                    ProductImageAlt = item.ProductImageAlt,
                    Notes = item.Notes,
                    ProductVariantId = item.ProductVariantId
                }).ToList() ?? [],
                SourceType = inbound.SourceType,
                SourceReference = inbound.SourceReference,
                Notes = inbound.Notes,
                ApprovedAt = inbound.ApprovedAt,
                ApprovedByName = inbound.ApprovedByName,
                RejectedAt = inbound.RejectedAt,
                RejectionReason = inbound.RejectionReason
            };
        }

        private ReturnDetailDto MapTicketDtoToReturnDetail(TicketDetailDto ticket)
        {
            string orderNumber = "ORD-" + ticket.OrderId.ToString().Substring(0, 8).ToUpper();

            return new ReturnDetailDto
            {
                Id = ticket.Id,
                ReturnSourceType = "Ticket",
                Status = ticket.TicketStatus.ToString(),
                CreatedAt = ticket.CreatedAt,
                CreatedByName = null,
                CustomerName = ticket.CustomerName,
                Items = ticket.Items?.Select(item => new ReturnItemDetailDto
                {
                    Id = item.Id,
                    ProductName = item.ProductName,
                    VariantName = item.VariantName,
                    Sku = item.Sku,
                    Quantity = item.Quantity,
                    ProductImageUrl = item.ProductImageUrl,
                    ProductImageAlt = null,
                    Notes = null,
                    ProductVariantId = item.ProductVariantId
                }).ToList() ?? [],
                OrderNumber = orderNumber,
                Reason = ticket.Reason,
                ResolutionType = ticket.ResolutionType?.ToString(),
                TicketType = ticket.TicketType.ToString(),
                OrderId = ticket.OrderId
            };
        }
    }
}

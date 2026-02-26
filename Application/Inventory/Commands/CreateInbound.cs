using Application.Core;
using Application.Interfaces;
using Application.Inventory.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Inventory.Commands;

public sealed class CreateInbound
{
    public sealed class Command : IRequest<Result<InboundRecordDto>>
    {
        public required CreateInboundDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<InboundRecordDto>>
    {
        public async Task<Result<InboundRecordDto>> Handle(Command request, CancellationToken ct)
        {
            Guid staffUserId = userAccessor.GetUserId();
            CreateInboundDto dto = request.Dto;

            // 1. Merge duplicate ProductVariantId entries
            List<InboundItemInputDto> mergedItems = [.. dto.Items
                .GroupBy(i => i.ProductVariantId)
                .Select(g => new InboundItemInputDto
                {
                    ProductVariantId = g.Key,
                    Quantity = g.Sum(i => i.Quantity),
                    Notes = string.Join("; ", g.Where(i => i.Notes != null).Select(i => i.Notes!)),
                })];

            // 2. Validate all product variants exist
            List<Guid> variantIds = [.. mergedItems.Select(i => i.ProductVariantId)];
            int existingCount = await context.ProductVariants
                .CountAsync(pv => variantIds.Contains(pv.Id), ct);

            if (existingCount != variantIds.Count)
                return Result<InboundRecordDto>.Failure("One or more product variants not found.", 404);

            // 3. Create InboundRecord
            InboundRecord record = new()
            {
                SourceType = dto.SourceType,
                SourceReference = dto.SourceReference,
                Status = InboundRecordStatus.PendingApproval,
                TotalItems = mergedItems.Sum(i => i.Quantity),
                Notes = dto.Notes,
                CreatedBy = staffUserId,
            };

            context.InboundRecords.Add(record);

            // 4. Create InboundRecordItems
            foreach (InboundItemInputDto item in mergedItems)
            {
                context.InboundRecordItems.Add(new InboundRecordItem
                {
                    InboundRecordId = record.Id,
                    ProductVariantId = item.ProductVariantId,
                    Quantity = item.Quantity,
                    Notes = string.IsNullOrWhiteSpace(item.Notes) ? null : item.Notes,
                });
            }

            // 5. Save
            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<InboundRecordDto>.Failure("Failed to create inbound record.", 500);

            // 6. Re-query with ProjectTo for consistent response
            InboundRecordDto? result = await context.InboundRecords
                .Where(ir => ir.Id == record.Id)
                .ProjectTo<InboundRecordDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (result == null)
                return Result<InboundRecordDto>.Failure("Failed to retrieve created inbound record.", 500);

            return Result<InboundRecordDto>.Success(result);
        }
    }
}

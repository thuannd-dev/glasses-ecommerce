using Application.Core;
using Application.Inventory.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Inventory.Queries;

public sealed class GetInventoryTransactions
{
    public sealed class Query : IRequest<Result<List<InventoryTransactionDto>>>
    {
        public TransactionType? TransactionType { get; set; }
        public ReferenceType? ReferenceType { get; set; }
        public Guid? ProductVariantId { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<List<InventoryTransactionDto>>>
    {
        public async Task<Result<List<InventoryTransactionDto>>> Handle(Query request, CancellationToken ct)
        {
            List<InventoryTransactionDto> transactions = await context.InventoryTransactions
                .AsNoTracking()
                .Where(t =>
                    (!request.TransactionType.HasValue || t.TransactionType == request.TransactionType.Value) &&
                    (!request.ReferenceType.HasValue || t.ReferenceType == request.ReferenceType.Value) &&
                    (!request.ProductVariantId.HasValue || t.ProductVariantId == request.ProductVariantId.Value)
                )
                .OrderByDescending(t => t.CreatedAt)
                .ProjectTo<InventoryTransactionDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result<List<InventoryTransactionDto>>.Success(transactions);
        }
    }
}

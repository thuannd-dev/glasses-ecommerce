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
    public sealed class Query : IRequest<Result<PagedResult<InventoryTransactionDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public TransactionType? TransactionType { get; set; }
        public ReferenceType? ReferenceType { get; set; }
        public Guid? ProductVariantId { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<PagedResult<InventoryTransactionDto>>>
    {
        public async Task<Result<PagedResult<InventoryTransactionDto>>> Handle(Query request, CancellationToken ct)
        {
            IQueryable<InventoryTransaction> query = context.InventoryTransactions.AsNoTracking();

            if (request.TransactionType.HasValue)
                query = query.Where(t => t.TransactionType == request.TransactionType.Value);

            if (request.ReferenceType.HasValue)
                query = query.Where(t => t.ReferenceType == request.ReferenceType.Value);

            if (request.ProductVariantId.HasValue)
                query = query.Where(t => t.ProductVariantId == request.ProductVariantId.Value);

            int totalCount = await query.CountAsync(ct);

            List<InventoryTransactionDto> transactions = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<InventoryTransactionDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            PagedResult<InventoryTransactionDto> result = new()
            {
                Items = transactions,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<InventoryTransactionDto>>.Success(result);
        }
    }
}

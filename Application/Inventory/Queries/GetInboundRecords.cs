using Application.Core;
using Application.Inventory.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Inventory.Queries;

public sealed class GetInboundRecords
{
    public sealed class Query : IRequest<Result<PagedResult<InboundRecordListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public InboundRecordStatus? Status { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<PagedResult<InboundRecordListDto>>>
    {
        public async Task<Result<PagedResult<InboundRecordListDto>>> Handle(Query request, CancellationToken ct)
        {
            IQueryable<InboundRecord> query = context.InboundRecords.AsNoTracking();

            if (request.Status.HasValue)
                query = query.Where(ir => ir.Status == request.Status.Value);

            int totalCount = await query.CountAsync(ct);

            List<InboundRecordListDto> records = await query
                .OrderByDescending(ir => ir.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<InboundRecordListDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            PagedResult<InboundRecordListDto> result = new()
            {
                Items = records,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<InboundRecordListDto>>.Success(result);
        }
    }
}

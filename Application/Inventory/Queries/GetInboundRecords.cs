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
    public sealed class Query : IRequest<Result<List<InboundRecordListDto>>>
    {
        public InboundRecordStatus? Status { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<List<InboundRecordListDto>>>
    {
        public async Task<Result<List<InboundRecordListDto>>> Handle(Query request, CancellationToken ct)
        {
            IQueryable<InboundRecord> query = context.InboundRecords.AsNoTracking();

            if (request.Status.HasValue)
                query = query.Where(ir => ir.Status == request.Status.Value);

            List<InboundRecordListDto> records = await query
                .OrderByDescending(ir => ir.CreatedAt)
                .ProjectTo<InboundRecordListDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result<List<InboundRecordListDto>>.Success(records);
        }
    }
}

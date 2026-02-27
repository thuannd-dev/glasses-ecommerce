using Application.Core;
using Application.Inventory.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Inventory.Queries;

public sealed class GetInboundDetail
{
    public sealed class Query : IRequest<Result<InboundRecordDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<InboundRecordDto>>
    {
        public async Task<Result<InboundRecordDto>> Handle(Query request, CancellationToken ct)
        {
            InboundRecordDto? record = await context.InboundRecords
                .AsNoTracking()
                .Where(ir => ir.Id == request.Id)
                .ProjectTo<InboundRecordDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (record == null)
                return Result<InboundRecordDto>.Failure("Inbound record not found.", 404);

            return Result<InboundRecordDto>.Success(record);
        }
    }
}

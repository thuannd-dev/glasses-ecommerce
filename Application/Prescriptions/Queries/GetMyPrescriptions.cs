using Application.Core;
using Application.Interfaces;
using Application.Prescriptions.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Prescriptions.Queries;

public sealed class GetMyPrescriptions
{
    public sealed class Query : IRequest<Result<PagedResult<PrescriptionListItemDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<PagedResult<PrescriptionListItemDto>>>
    {
        public async Task<Result<PagedResult<PrescriptionListItemDto>>> Handle(Query request, CancellationToken ct)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<PrescriptionListItemDto>>
                    .Failure("Invalid pagination parameters.", 400);

            Guid userId = userAccessor.GetUserId();

            IQueryable<Prescription> query = context.Prescriptions
                .AsNoTracking()
                .Where(p => p.Order.UserId == userId);

            int totalCount = await query.CountAsync(ct);

            List<PrescriptionListItemDto> items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<PrescriptionListItemDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            PagedResult<PrescriptionListItemDto> result = new()
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<PrescriptionListItemDto>>.Success(result);
        }
    }
}

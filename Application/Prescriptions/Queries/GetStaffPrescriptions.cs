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

public sealed class GetStaffPrescriptions
{
    public sealed class Query : IRequest<Result<PagedResult<StaffPrescriptionListDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool? IsVerified { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<PagedResult<StaffPrescriptionListDto>>>
    {
        public async Task<Result<PagedResult<StaffPrescriptionListDto>>> Handle(Query request, CancellationToken ct)
        {
            if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
                return Result<PagedResult<StaffPrescriptionListDto>>
                    .Failure("Invalid pagination parameters.", 400);

            Guid staffUserId = userAccessor.GetUserId();

            IQueryable<Prescription> query = context.Prescriptions
                .AsNoTracking()
                .Where(p => p.Order.CreatedBySalesStaff == staffUserId ||
                            (p.Order.OrderSource == OrderSource.Online &&
                             (p.Order.OrderStatus == OrderStatus.Pending ||
                              p.Order.OrderStatus == OrderStatus.Confirmed ||
                              p.Order.OrderStatus == OrderStatus.Cancelled)));

            if (request.IsVerified.HasValue)
                query = query.Where(p => p.IsVerified == request.IsVerified.Value);

            int totalCount = await query.CountAsync(ct);

            List<StaffPrescriptionListDto> items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<StaffPrescriptionListDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            PagedResult<StaffPrescriptionListDto> result = new()
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return Result<PagedResult<StaffPrescriptionListDto>>.Success(result);
        }
    }
}

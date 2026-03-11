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

public sealed class GetStaffPrescriptionDetail
{
    public sealed class Query : IRequest<Result<StaffPrescriptionDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<StaffPrescriptionDto>>
    {
        public async Task<Result<StaffPrescriptionDto>> Handle(Query request, CancellationToken ct)
        {
            Guid staffUserId = userAccessor.GetUserId();

            StaffPrescriptionDto? prescription = await context.Prescriptions
                .AsNoTracking()
                .Where(p => p.Id == request.Id &&
                            (p.Order.CreatedBySalesStaff == staffUserId ||
                             (p.Order.OrderSource == OrderSource.Online &&
                              (p.Order.OrderStatus == OrderStatus.Pending ||
                               p.Order.OrderStatus == OrderStatus.Confirmed ||
                               p.Order.OrderStatus == OrderStatus.Cancelled))))
                .ProjectTo<StaffPrescriptionDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (prescription == null)
                return Result<StaffPrescriptionDto>.Failure("Prescription not found.", 404);

            return Result<StaffPrescriptionDto>.Success(prescription);
        }
    }
}

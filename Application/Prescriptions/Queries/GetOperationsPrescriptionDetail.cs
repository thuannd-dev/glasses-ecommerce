using Application.Core;
using Application.Prescriptions.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Prescriptions.Queries;

public sealed class GetOperationsPrescriptionDetail
{
    public sealed class Query : IRequest<Result<StaffPrescriptionDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<StaffPrescriptionDto>>
    {
        public async Task<Result<StaffPrescriptionDto>> Handle(Query request, CancellationToken ct)
        {
            StaffPrescriptionDto? prescription = await context.Prescriptions
                .AsNoTracking()
                .Where(p => p.Id == request.Id)
                .ProjectTo<StaffPrescriptionDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (prescription == null)
                return Result<StaffPrescriptionDto>.Failure("Prescription not found.", 404);

            return Result<StaffPrescriptionDto>.Success(prescription);
        }
    }
}

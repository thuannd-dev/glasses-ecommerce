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

public sealed class GetMyPrescriptionDetail
{
    public sealed class Query : IRequest<Result<MyPrescriptionDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<MyPrescriptionDto>>
    {
        public async Task<Result<MyPrescriptionDto>> Handle(Query request, CancellationToken ct)
        {
            Guid userId = userAccessor.GetUserId();

            MyPrescriptionDto? prescription = await context.Prescriptions
                .AsNoTracking()
                .Where(p => p.Id == request.Id && p.Order.UserId == userId)
                .ProjectTo<MyPrescriptionDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (prescription == null)
                return Result<MyPrescriptionDto>.Failure("Prescription not found.", 404);

            return Result<MyPrescriptionDto>.Success(prescription);
        }
    }
}

using Application.Core;
using Application.FeatureToggles.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.FeatureToggles.Queries;

public sealed class GetFeatureToggleById
{
    public sealed class Query : IRequest<Result<FeatureToggleDto>>
    {
        public required Guid Id { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<FeatureToggleDto>>
    {
        public async Task<Result<FeatureToggleDto>> Handle(Query request, CancellationToken ct)
        {
            FeatureToggleDto? dto = await context.FeatureToggles
                .AsNoTracking()
                .Where(ft => ft.Id == request.Id)
                .ProjectTo<FeatureToggleDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (dto == null)
                return Result<FeatureToggleDto>.Failure("Feature toggle not found.", 404);

            return Result<FeatureToggleDto>.Success(dto);
        }
    }
}

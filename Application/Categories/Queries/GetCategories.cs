using Application.Categories.DTOs;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Categories.Queries;

public sealed class GetCategories
{
    public sealed class Query : IRequest<Result<List<ProductCategoryDto>>>
    {
    }

    public sealed class Handler(AppDbContext context, IMapper mapper) 
        : IRequestHandler<Query, Result<List<ProductCategoryDto>>>
    {
        public async Task<Result<List<ProductCategoryDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            List<ProductCategoryDto> categories = await context.ProductCategories
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ProjectTo<ProductCategoryDto>(mapper.ConfigurationProvider)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return Result<List<ProductCategoryDto>>.Success(categories);
        }
    }
}

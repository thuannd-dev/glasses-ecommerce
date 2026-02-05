using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Queries;

public sealed class GetBrands
{
    public sealed class Query : IRequest<Result<List<string>>>
    {
    }

    public sealed class Handler(AppDbContext context) 
        : IRequestHandler<Query, Result<List<string>>>
    {
        public async Task<Result<List<string>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var brands = await context.Products
                .Where(p => p.Brand != null && p.Brand != string.Empty)
                .Select(p => p.Brand!)
                .Distinct()
                .OrderBy(b => b)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return Result<List<string>>.Success(brands);
        }
    }
}

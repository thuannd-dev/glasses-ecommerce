using System;
using System.Net;
using Application.Activities.DTOs;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Queries;

public class GetActivityDetails
{
    public class Query : IRequest<Result<ActivityDto>>
    {
        public required Guid Id { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, Result<ActivityDto>>
    {
        public async Task<Result<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            //?? is called null-coalescing operator use to check null
            //if the value of variable in the left operator is null RETURN the value of the right operator.
            var activity = await context.Activities
                .Where(a => a.Id == request.Id)
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);     
            //ProjectTo must be the last call in the LINQ method chain.
            //Because ORMs work with entities, not DTOs.
            //ProjectTo translates the query to select only the needed fields into the DTO.
            //If you try to apply further filtering or transformations after ProjectTo,     
            //it may lead to runtime errors or inefficient queries since the ORM cannot map those operations back to the database query. 
            if (activity == null) return Result<ActivityDto>.Failure("Activity Not Found.", 404);

            return Result<ActivityDto>.Success(activity);
        }
    }

}

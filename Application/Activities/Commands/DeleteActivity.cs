using System;
using Application.Core;
using MediatR;
using Persistence;

namespace Application.Activities.Commands;

public class DeleteActivity
{
    //When you want to effectively return nothing from a MediatR command, you can use the Unit type
    //which is a struct provided by MediatR that represents a void return type.
    public class Command : IRequest<Result<Unit>>
    {
        public required Guid Id { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities.FindAsync([request.Id], cancellationToken);

            if (activity == null) return Result<Unit>.Failure("Activity Not Found.", 404);

            context.Remove(activity);
            
            var isSuccess = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!isSuccess) return Result<Unit>.Failure("Failed to delete the activity.", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }

}

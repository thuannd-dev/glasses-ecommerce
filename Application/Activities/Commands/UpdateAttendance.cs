using System;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Commands;

public class UpdateAttendance
{
    public class Command : IRequest<Result<Unit>>
    {
        //activity id
        public required Guid Id { get; set; }
    }

    public class Handler(IUserAccessor userAccessor, AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        //Adding or updating attendance
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities
                .Include(x => x.Attendees)
                .ThenInclude(x => x.User)
                .SingleOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (activity == null) return Result<Unit>.Failure("Activity not found", 404);

            var user = await userAccessor.GetUserAsync();

            //should using activity here to query in memory instead of using dbcontext to query in database
            //Because we using .Include(x => x.Attendees).ThenInclude(x => x.User)
            //So EF load activity, load Attendees of activity, load User of attendee
            //=> activity.Attendees have data, is a List<ActivityAttendee> in memory
            //=> activity.Attendees.FirstOrDefault(x => x.UserId == user.Id) is Linq to object in memory
            //=> Save query to database
            var attendance = activity.Attendees.FirstOrDefault(x => x.UserId == user.Id);
            var isHost = activity.Attendees.Any(x => x.IsHost && x.UserId == user.Id);

            if (attendance != null)
            {
                //Remove user from activity or update isCancel if isHost
                if(isHost) activity.IsCancelled = !activity.IsCancelled;
                else activity.Attendees.Remove(attendance);
            }
            else
            {
                //Adding a attendance
                activity.Attendees.Add(new ActivityAttendee
                {
                    UserId = user.Id,
                    ActivityId = activity.Id,
                    IsHost = false
                });
            }

            var result  = await context.SaveChangesAsync(cancellationToken) > 0;

            return result 
            ? Result<Unit>.Success(Unit.Value)
            : Result<Unit>.Failure("Problem updating the DB", 400);

        }
    }

}

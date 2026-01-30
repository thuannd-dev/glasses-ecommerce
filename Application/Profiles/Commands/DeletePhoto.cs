using System;
using Application.Core;
using Application.Interfaces;
using MediatR;
using Persistence;

namespace Application.Profiles.Commands;

public class DeletePhoto
{
    public class Command : IRequest<Result<Unit>>
    {
        public required Guid PhotoId { get; set; }
    }

    public class Handler(AppDbContext context, IUserAccessor userAccessor, IPhotoService photoService)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserWithPhotosAsync();

            var photo = user.Photos.FirstOrDefault(x => x.Id == request.PhotoId);

            if (photo == null) return Result<Unit>.Failure("Cannot find photo", 400);

            //don't allow user to delete main photo
            // if (photo.Url == user.ImageUrl) return Result<Unit>.Failure("Cannot delete main photo", 400);

            //if don't delete successfully from cloudinary it will throw exception
            //so don't need to check the result here
            // await photoService.DeletePhoto(photo.PublicId);

            // user.Photos.Remove(photo);

            // var result = await context.SaveChangesAsync(cancellationToken) > 0;

            // return result
            //     ? Result<Unit>.Success(Unit.Value)
            //     : Result<Unit>.Failure("Problem deleting photo", 400);


            //Above solution is correct but may cause inconsistency between database and cloudinary
            //DB is source of truth
            //If DB fail → Cloudinary have extra photo
            //If Cloudinary fail → DB have photo that not exist in Cloudinary
            // Avoid broken URL
            user.Photos.Remove(photo);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result)
                return Result<Unit>.Failure("Problem deleting photo", 400);

            //if don't delete successfully from cloudinary it will throw exception
            //so don't need to check the result here
            await photoService.DeletePhoto(photo.PublicId);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

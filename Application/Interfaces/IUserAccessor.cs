using System;
using Domain;

namespace Application.Interfaces;

public interface IUserAccessor
{
    Guid GetUserId();
    Guid? GetUserIdOrDefault();
    Task<User> GetUserAsync();
    Task<User> GetUserWithPhotosAsync();
}

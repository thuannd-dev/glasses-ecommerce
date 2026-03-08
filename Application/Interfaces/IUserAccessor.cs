using System;
using Domain;

namespace Application.Interfaces;

public interface IUserAccessor
{
    Guid GetUserId();
    Guid? GetUserIdOrNull();
    Task<User> GetUserAsync();
    Task<User> GetUserWithPhotosAsync();
}

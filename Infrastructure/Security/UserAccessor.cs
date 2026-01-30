using System;
using System.Security.Claims;
using Application.Interfaces;
using Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Infrastructure.Security;

public class UserAccessor(IHttpContextAccessor httpContextAccessor, AppDbContext dbContext) : IUserAccessor
{
    public async Task<User> GetUserAsync()
    {
        //We need query database to get user object.
        //Because claim store a part of user info only (like id, username, roles,...) not entire user info.
        //And the data in claim may be outdated.
        return await dbContext.Users.FindAsync(GetUserId())
            ?? throw new UnauthorizedAccessException("No user is logged in");
    }

    public Guid GetUserId()
    {
        //ClaimTypes.NameIdentifier is the user ID stored in the cookie when user is authenticated.
        //If no user is authenticated, return null and throw exception.
        //This way no query to database.
        var userIdValue = httpContextAccessor.HttpContext?.User
            .FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue))
            throw new UnauthorizedAccessException("User is not authenticated");

        if (!Guid.TryParse(userIdValue, out var userId))
            throw new UnauthorizedAccessException("Invalid user id claim");

        return userId;
    }

    public async Task<User> GetUserWithPhotosAsync()
    {
        return await dbContext.Users
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(x => x.Id == GetUserId())
                ?? throw new UnauthorizedAccessException("No user is logged in");
    }
}

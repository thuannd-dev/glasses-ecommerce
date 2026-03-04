using Application.Admin.DTOs;
using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Admin.Queries;

public sealed class GetAllUsers
{
    public sealed class Query : IRequest<Result<List<UserRoleDto>>>
    {
    }

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Query, Result<List<UserRoleDto>>>
    {
        public async Task<Result<List<UserRoleDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            // Query 1: all users
            List<User> users = await context.Users
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            // Query 2: all (userId, roleName) pairs in one join — eliminates N+1
            var userRolePairs = await (
                from ur in context.UserRoles
                join r in context.Roles on ur.RoleId equals r.Id
                select new { ur.UserId, RoleName = r.Name! }
            ).AsNoTracking().ToListAsync(cancellationToken);

            Dictionary<Guid, List<string>> rolesByUser = userRolePairs
                .GroupBy(x => x.UserId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.RoleName).ToList());

            List<UserRoleDto> userRoleDtos = users.Select(u => new UserRoleDto
            {
                UserId = u.Id,
                UserName = u.UserName ?? string.Empty,
                Email = u.Email ?? string.Empty,
                DisplayName = u.DisplayName ?? string.Empty,
                Roles = rolesByUser.TryGetValue(u.Id, out List<string>? roles) ? roles : []
            }).ToList();

            return Result<List<UserRoleDto>>.Success(userRoleDtos);
        }
    }
}

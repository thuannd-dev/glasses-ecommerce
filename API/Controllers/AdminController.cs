using Application.Admin.Commands;
using Application.Admin.DTOs;
using Application.Admin.Queries;
using Application.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin")]
public sealed class AdminController : BaseApiController
{
    [HttpGet("roles")]
    public async Task<ActionResult<List<RoleDto>>> GetAllRoles()
    {
        return HandleResult(await Mediator.Send(new GetAllRoles.Query()));
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<UserRoleDto>>> GetAllUsers()
    {
        return HandleResult(await Mediator.Send(new GetAllUsers.Query()));
    }

    [HttpPost("assign-roles")]
    public async Task<ActionResult> AssignRoles(AssignRoleDto assignRoleDto)
    {
        return HandleResult(await Mediator.Send(new AssignRoles.Command
        {
            UserId = assignRoleDto.UserId,
            Roles = assignRoleDto.Roles
        }));
    }
}

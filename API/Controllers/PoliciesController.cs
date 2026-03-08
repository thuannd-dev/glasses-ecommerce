using Application.Core;
using Application.Policies.DTOs;
using Application.Policies.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/policies")]
public sealed class PoliciesController : BaseApiController
{
    /// <summary>
    /// Gets a list of all currently active policies.
    /// Used by frontend (public or users) and operations to view return/warranty/refund rules.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("active")]
    public async Task<IActionResult> GetActivePolicies()
    {
        Result<List<ActivePolicyDto>> result = await Mediator.Send(new GetActivePolicies.Query());
        return HandleResult(result);
    }
}

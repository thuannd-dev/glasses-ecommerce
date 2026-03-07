using Application.Core;
using Application.Policies.Commands;
using Application.Policies.DTOs;
using Application.Policies.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/policies")]
public sealed class AdminPoliciesController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetPolicies(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] PolicyType? policyType = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? search = null)
    {
        Result<PagedResult<PolicyConfigurationDto>> result = await Mediator.Send(new GetPolicyList.Query
        {

            PageNumber = pageNumber,
            PageSize = pageSize,
            PolicyType = policyType,
            IsActive = isActive,
            Search = search
        });
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPolicyDetails(Guid id)
    {
        Result<PolicyConfigurationDto> result = await Mediator.Send(new GetPolicyDetails.Query { Id = id });
        return HandleResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePolicy([FromBody] CreatePolicyDto dto)
    {
        Result<PolicyConfigurationDto> result = await Mediator.Send(new CreatePolicy.Command { Dto = dto });
        if (!result.IsSuccess) return HandleResult(result);
        return CreatedAtAction(nameof(GetPolicyDetails), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePolicy(Guid id, [FromBody] UpdatePolicyDto dto)
    {
        Result<PolicyConfigurationDto> result = await Mediator.Send(new UpdatePolicy.Command { Id = id, Dto = dto });
        return HandleResult(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePolicy(Guid id)
    {
        return HandleResult(await Mediator.Send(new DeletePolicy.Command { Id = id }));
    }
}

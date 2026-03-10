using Application.Core;
using Application.FeatureToggles.Commands;
using Application.FeatureToggles.DTOs;
using Application.FeatureToggles.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/feature-toggles")]
public sealed class AdminFeatureTogglesController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? isEnabled = null,
        [FromQuery] string? scope = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        Result<PagedResult<FeatureToggleDto>> result = await Mediator.Send(new GetFeatureToggleList.Query
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            IsEnabled = isEnabled,
            Scope = scope,
            Search = search
        }, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        Result<FeatureToggleDto> result = await Mediator.Send(
            new GetFeatureToggleById.Query { Id = id }, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateFeatureToggleDto dto, CancellationToken cancellationToken)
    {
        Result<FeatureToggleDto> result = await Mediator.Send(
            new CreateFeatureToggle.Command { Dto = dto }, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateFeatureToggleDto dto, CancellationToken cancellationToken)
    {
        Result<FeatureToggleDto> result = await Mediator.Send(new UpdateFeatureToggle.Command
        {
            Id = id,
            Dto = dto
        }, cancellationToken);
        return HandleResult(result);
    }

    [HttpPatch("{id}/enabled")]
    public async Task<IActionResult> SetEnabled(Guid id, SetFeatureToggleEnabledDto dto, CancellationToken cancellationToken)
    {
        Result<FeatureToggleDto> result = await Mediator.Send(new SetFeatureToggleEnabled.Command
        {
            Id = id,
            IsEnabled = dto.IsEnabled
        }, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        Result<Unit> result = await Mediator.Send(
            new DeleteFeatureToggle.Command { Id = id }, cancellationToken);
        return HandleResult(result);
    }
}

using Application.Core;
using Application.FeatureToggles.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[AllowAnonymous]
[Route("api/feature-toggles")]
public sealed class FeatureTogglesController : BaseApiController
{
    [HttpGet("check/{featureName}")]
    public async Task<IActionResult> Check(
        string featureName,
        [FromQuery] string? scope = null,
        [FromQuery] string? scopeValue = null,
        CancellationToken cancellationToken = default)
    {
        Result<bool> result = await Mediator.Send(new CheckFeatureEnabled.Query
        {
            FeatureName = featureName,
            Scope = scope,
            ScopeValue = scopeValue
        }, cancellationToken);
        return HandleResult(result);
    }
}

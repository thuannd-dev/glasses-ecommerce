using Application.Core;
using Application.Promotions.DTOs;
using Application.Promotions.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/promotions")]
public sealed class PromotionsController : BaseApiController
{
    /// <summary>
    /// Gets a list of all currently active and valid promotions for the frontend to display.
    /// Only returns promotions with IsPublic = true.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("active")]
    public async Task<IActionResult> GetActivePromotions()
    {
        Result<List<ActivePromotionDto>> result = await Mediator.Send(new GetActivePromotions.Query());
        return HandleResult(result);
    }
    /// <summary>
    /// Validates a promo code and returns a discount preview for the given order total.
    /// Requires authentication so per-customer usage limits can be checked.
    /// Always returns 200 OK — use IsValid + Error for inline frontend display.
    /// </summary>
    [Authorize]
    [HttpPost("validate")]
    public async Task<IActionResult> ValidatePromoCode([FromBody] ValidatePromoCodeDto dto)
    {
        Result<PromoValidationResultDto> result = await Mediator.Send(new ValidatePromoCode.Query
        {
            Dto = dto,
        });
        return HandleResult(result);
    }
}

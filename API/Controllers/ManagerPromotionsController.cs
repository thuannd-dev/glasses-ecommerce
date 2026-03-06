using Application.Core;
using Application.Promotions.Commands;
using Application.Promotions.DTOs;
using Application.Promotions.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Manager")]
[Route("api/manager/promotions")]
public sealed class ManagerPromotionsController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetPromotions(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? isActive = null,
        [FromQuery] int? promotionType = null,
        [FromQuery] DateTime? validFrom = null,
        [FromQuery] DateTime? validTo = null)
    {
        Result<PagedResult<PromotionListDto>> result = await Mediator.Send(new GetPromotions.Query
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            IsActive = isActive,
            PromotionType = promotionType,
            ValidFrom = validFrom,
            ValidTo = validTo,
        });
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPromotion(Guid id)
    {
        Result<PromotionDetailDto> result = await Mediator.Send(
            new GetPromotionDetail.Query { Id = id });
        return HandleResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePromotion([FromBody] CreatePromotionDto dto)
    {
        Result<PromotionDetailDto> result = await Mediator.Send(
            new CreatePromotion.Command { Dto = dto });
        if (!result.IsSuccess) return HandleResult(result);
        return CreatedAtAction(nameof(GetPromotion), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePromotion(Guid id, [FromBody] UpdatePromotionDto dto)
    {
        Result<PromotionDetailDto> result = await Mediator.Send(
            new UpdatePromotion.Command { Id = id, Dto = dto });
        return HandleResult(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeactivatePromotion(Guid id)
    {
        Result<PromotionDetailDto> result = await Mediator.Send(
            new DeactivatePromotion.Command { Id = id });
        return HandleResult(result);
    }
}

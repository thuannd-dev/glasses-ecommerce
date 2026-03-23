using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[AllowAnonymous]
[Route("api/shipping")]
public class ShippingController : BaseApiController
{
    private readonly IGHNService _ghnService;

    public ShippingController(IGHNService ghnService)
    {
        _ghnService = ghnService;
    }

    [HttpGet("fee")]
    public async Task<IActionResult> GetShippingFee(
        [FromQuery] int districtId, 
        [FromQuery] string wardCode, 
        [FromQuery] int weight = 200, 
        [FromQuery] decimal insuranceValue = 0)
    {
        if (districtId <= 0 || string.IsNullOrWhiteSpace(wardCode))
        {
            return BadRequest("districtId and wardCode are required.");
        }

        try
        {
            var fee = await _ghnService.CalculateShippingFeeAsync(districtId, wardCode, weight, insuranceValue);
            return Ok(new { fee });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

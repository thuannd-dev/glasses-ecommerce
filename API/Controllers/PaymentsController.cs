using Application.Interfaces;
using Application.Payments.Commands;
using Application.Payments.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/me/payments")]
public sealed class PaymentsController(IVnPayService vnPayService) : BaseApiController
{
    [HttpPost("create-url")]
    public async Task<IActionResult> CreatePaymentUrl(PaymentInformationModel dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new CreatePaymentUrls.Command { Model = dto }, ct));
    }

    // VnPay gọi callback này — không yêu cầu xác thực
    [AllowAnonymous]
    [HttpGet("/api/payments/callback")]
    public IActionResult Callback()
    {
        PaymentResponseModel response = vnPayService.PaymentExecute(Request.Query);

        return Ok(response);
    }
}

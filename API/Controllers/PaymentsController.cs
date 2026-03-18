using Application.Core;
using Application.Interfaces;
using Application.Payments.Commands;
using Application.Payments.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/me/payments")]
public sealed class PaymentsController(IVnPayService vnPayService) : BaseApiController
{
    [HttpPost("create-url")]
    public async Task<IActionResult> CreatePaymentUrl(PaymentInformationDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new CreatePaymentUrls.Command { Model = dto }, ct));
    }

    // VnPay gọi server-to-server sau thanh toán — không yêu cầu xác thực
    [AllowAnonymous]
    [HttpGet("/api/payments/vnpay/ipn")]
    public async Task<IActionResult> IpnCallback(CancellationToken ct)
    {
        PaymentResponseDto response = vnPayService.PaymentExecute(Request.Query);

        if (response.VnPayResponseCode == "97")
            return Ok(new { RspCode = "97", Message = "Invalid signature" });

        Result<Unit> result = await Mediator.Send(new HandleVnPayIpn.Command { Response = response }, ct);

        if (result.IsSuccess)
            return Ok(new { RspCode = "00", Message = "Confirm Success" });

        return result.Code switch
        {
            400 => Ok(new { RspCode = "04", Message = "Invalid amount" }),
            404 => Ok(new { RspCode = "01", Message = "Order not found" }),
            409 => Ok(new { RspCode = "02", Message = "Order already confirmed" }),
            _ => Ok(new { RspCode = "99", Message = "Unknown error" })
        };
    }
}

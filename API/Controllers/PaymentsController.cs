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
    public async Task<IActionResult> CreatePaymentUrl(PaymentInformationModel dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new CreatePaymentUrls.Command { Model = dto }, ct));
    }

    // VnPay gọi server-to-server sau thanh toán — không yêu cầu xác thực
    [AllowAnonymous]
    [HttpGet("/api/payments/vnpay/ipn")]
    public async Task<IActionResult> IpnCallback(CancellationToken ct)
    {
        PaymentResponseModel response = vnPayService.PaymentExecute(Request.Query);

        Result<Unit> result = await Mediator.Send(new HandleVnPayIpn.Command { Response = response }, ct);

        // VnPay yêu cầu response format cụ thể để xác nhận đã nhận IPN
        return result.IsSuccess
            ? Ok(new { RspCode = "00", Message = "Confirm Success" })
            : Ok(new { RspCode = "99", Message = "Unknown error" });
    }
}

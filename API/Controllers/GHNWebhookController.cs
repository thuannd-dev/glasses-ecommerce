using Application.Orders.Commands;
using Application.Orders.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[AllowAnonymous]
[Route("api/webhooks/ghn")]
public class GHNWebhookController : BaseApiController
{
    // GHN will call this endpoint to update order status
    [HttpPost]
    public async Task<IActionResult> HandleWebhook([FromBody] GHNWebhookPayloadDto payload, CancellationToken ct)
    {
        // TODO in production - add token validation: Validate GHN Webhook Token Signature here using Request.Headers if required by GHN

        var result = await Mediator.Send(new ProcessGHNWebhook.Command { Payload = payload }, ct);

        if (!result.IsSuccess)
        {
            // GHN should know we received it, even if we failed to process logically, 
            // returning 200 avoids infinite retries for business logic errors on our side.
            // But if it's a parsing/critical error, we might return 400.
            return Ok(new { success = false, message = result.Error });
        }

        return Ok(new { success = true });
    }
}

using Application.Addresses.Commands;
using Application.Addresses.DTOs;
using Application.Addresses.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/me/addresses")]
public sealed class AddressesController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult> GetAddresses(CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new GetAddresses.Query(), cancellationToken));
    }

    [HttpGet("default")]
    public async Task<ActionResult> GetDefaultAddress(CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new GetDefaultAddress.Query(), cancellationToken));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetAddressDetail(Guid id, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new GetAddressDetail.Query { AddressId = id }, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult> CreateAddress(CreateAddressDto dto, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new CreateAddress.Command { CreateAddressDto = dto }, cancellationToken));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateAddress(Guid id, UpdateAddressDto dto, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new UpdateAddress.Command
        {
            AddressId = id,
            UpdateAddressDto = dto
        }, cancellationToken));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAddress(Guid id, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new DeleteAddress.Command { AddressId = id }, cancellationToken));
    }

    [HttpPut("{id}/default")]
    public async Task<ActionResult> SetDefaultAddress(Guid id, CancellationToken cancellationToken)
    {
        return HandleResult(await Mediator.Send(new SetDefaultAddress.Command { AddressId = id }, cancellationToken));
    }
}

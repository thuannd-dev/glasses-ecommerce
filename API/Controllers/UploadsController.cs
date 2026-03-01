using Application.Uploads.Commands;
using Application.Uploads.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/uploads")]
public sealed class UploadsController : BaseApiController
{
    /// <summary>
    /// Generic endpoint for uploading an image to the cloud provider.
    /// Does NOT save any record to the database. Returns the Cloud URL directly.
    /// Used by frontend for uploading After-Sales Ticket evidence, etc.
    /// </summary>
    [HttpPost("image")]
    public async Task<ActionResult<ImageUploadDto>> UploadImage(IFormFile file)
    {
        return HandleResult(await Mediator.Send(new UploadImage.Command { File = file }));
    }
}

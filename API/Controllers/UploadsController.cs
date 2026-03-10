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
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        // Validate file size (max 5MB)
        const long maxFileSize = 5 * 1024 * 1024; // 5MB
        if (file.Length > maxFileSize)
        {
            return BadRequest("File size exceeds maximum allowed (5MB).");
        }

        // Validate file type
        var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf" };
        if (!allowedMimeTypes.Contains(file.ContentType?.ToLower()))
        {
            return BadRequest("Invalid file type. Allowed types: JPEG, PNG, GIF, WebP, PDF.");
        }

        return HandleResult(await Mediator.Send(new UploadImage.Command { File = file }));
    }
}

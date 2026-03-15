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

        return HandleResult(await Mediator.Send(new UploadImage.Command { File = file }));
    }

    /// <summary>
    /// Generic endpoint for uploading a GLB (3D model) file to the cloud provider.
    /// Does NOT save any record to the database. Returns the Cloud URL directly.
    /// Used by frontend for uploading 3D model assets for product variants, etc.
    /// </summary>
    [HttpPost("glb")]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<GlbUploadDto>> UploadGlb(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        string extension = Path.GetExtension(file.FileName);
        if (!extension.Equals(".glb", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only .glb files are accepted.");

        const long maxFileSize = 10 * 1024 * 1024; // 10 MB — Cloudinary raw file limit
        if (file.Length > maxFileSize)
            return BadRequest("File size exceeds the 10 MB limit.");

        return HandleResult(await Mediator.Send(new UploadGlb.Command { File = file }));
    }
}


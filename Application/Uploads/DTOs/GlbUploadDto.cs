namespace Application.Uploads.DTOs;

/// <summary>
/// DTO returning the result of securely uploading a GLB file to the cloud provider (without DB tracking).
/// </summary>
public sealed class GlbUploadDto
{
    public required string Url { get; set; }
    public required string PublicId { get; set; }
}

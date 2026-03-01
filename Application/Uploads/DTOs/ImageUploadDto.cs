namespace Application.Uploads.DTOs;

/// <summary>
/// DTO returning the result of securely uploading an image to the cloud provider (without DB tracking).
/// </summary>
public sealed class ImageUploadDto
{
    public required string Url { get; set; }
    public required string PublicId { get; set; }
}

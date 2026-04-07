namespace Application.Core;

/// <summary>
/// Cloudinary configuration constants for image URL validation
/// </summary>
internal static class CloudinarySettings
{
    /// <summary>
    /// Allowed Cloudinary domain for prescription image URLs
    /// </summary>
    public const string AllowedDomain = "res.cloudinary.com";

    /// <summary>
    /// Maximum allowed length for image URLs
    /// </summary>
    public const int MaxUrlLength = 2048;
}

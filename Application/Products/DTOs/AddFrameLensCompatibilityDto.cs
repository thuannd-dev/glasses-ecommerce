namespace Application.Products.DTOs;

/// <summary>
/// DTO request để link một Lens Product vào một Frame Product
/// </summary>
public sealed class AddFrameLensCompatibilityDto
{
    public required Guid LensProductId { get; set; }
}

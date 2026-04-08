using Domain;

namespace Application.Products.DTOs;

/// <summary>
/// DTO response dùng trong danh sách lens tương thích với một frame (Management view)
/// </summary>
public sealed class CompatibleLensLinkDto
{
    public Guid LensProductId { get; set; }
    public string LensProductName { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public ProductStatus Status { get; set; }
}

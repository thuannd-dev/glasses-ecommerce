namespace Application.Products.DTOs;

/// <summary>
/// DTO request để cập nhật ProductVariant — tất cả field đều optional (partial update)
/// </summary>
public sealed class UpdateVariantDto
{
    public string? SKU { get; set; }
    public string? VariantName { get; set; }
    public string? Color { get; set; }
    public string? Size { get; set; }
    public string? Material { get; set; }
    public decimal? FrameWidth { get; set; }
    public decimal? LensWidth { get; set; }
    public decimal? BridgeWidth { get; set; }
    public decimal? TempleLength { get; set; }
    public decimal? Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public bool? IsActive { get; set; }
}

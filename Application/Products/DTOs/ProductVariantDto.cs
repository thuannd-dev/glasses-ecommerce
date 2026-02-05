namespace Application.Products.DTOs;

public sealed class ProductVariantDto
{
    public required Guid Id { get; set; }
    public required string SKU { get; set; }
    public string? VariantName { get; set; }
    public string? Color { get; set; }
    public string? Size { get; set; }
    public string? Material { get; set; }
    public decimal? FrameWidth { get; set; }
    public decimal? LensWidth { get; set; }
    public decimal? BridgeWidth { get; set; }
    public decimal? TempleLength { get; set; }
    public required decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public bool IsActive { get; set; }
    public int QuantityAvailable { get; set; }
    public ICollection<ProductImageDto> Images { get; set; } = [];
}

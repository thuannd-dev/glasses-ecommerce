using System;

namespace Domain;

public class ProductVariant
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required Guid ProductId { get; set; }

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

    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Product Product { get; set; } = null!;
    
    public Stock? Stock { get; set; }
    public ICollection<ProductImage> Images { get; set; } = [];
}

namespace Application.Products.DTOs;

/// <summary>
/// DTO request để thêm một ProductVariant mới vào Product
/// </summary>
public sealed class CreateVariantDto
{
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

    /// <summary>
    /// Khi true: khách có thể add vào giỏ và checkout dù kho không đủ.
    /// Hệ thống tự động set OrderType = PreOrder khi checkout.
    /// Mặc định false — có thể thay đổi sau via PATCH api/manager/products/{id}/variants/{variantId}/preorder.
    /// </summary>
    public bool IsPreOrder { get; set; } = false;
}

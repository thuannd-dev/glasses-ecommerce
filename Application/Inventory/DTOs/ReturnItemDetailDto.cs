namespace Application.Inventory.DTOs;

/// <summary>
/// DTO response cho từng sản phẩm trong phiếu hoàn hàng
/// </summary>
public sealed class ReturnItemDetailDto
{
    public Guid Id { get; set; }
    public string? ProductName { get; set; }
    public string? VariantName { get; set; }
    public string? Sku { get; set; }
    public int Quantity { get; set; }
    public string? ProductImageUrl { get; set; }
    public string? ProductImageAlt { get; set; }
    public string? Notes { get; set; }
    public Guid ProductVariantId { get; set; }
}

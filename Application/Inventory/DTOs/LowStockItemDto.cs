namespace Application.Inventory.DTOs;

/// <summary>
/// DTO chứa thông tin các sản phẩm sắp hết hàng hoặc đã hết hàng (QuantityAvailable thiếu hụt).
/// </summary>
public sealed class LowStockItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? Brand { get; set; }
    public Guid VariantId { get; set; }
    public string? VariantName { get; set; }
    public string Sku { get; set; } = null!;
    public int QuantityOnHand { get; set; }
    public int QuantityReserved { get; set; }
    public int QuantityAvailable { get; set; }
    public int QuantityPreOrdered { get; set; }
}

namespace Application.Inventory.DTOs;

/// <summary>
/// DTO chứa thông tin tóm tắt PreOrder của một variant cụ thể.
/// Dùng để manager theo dõi nhu cầu PreOrder (demand) chưa được hoàn thành.
/// </summary>
public sealed class PreOrderSummaryItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? Brand { get; set; }
    public Guid VariantId { get; set; }
    public string? VariantName { get; set; }
    public string Sku { get; set; } = null!;
    
    /// <summary>
    /// Số lượng khách đã đặt trước nhưng chưa có hàng trong kho
    /// </summary>
    public int QuantityPreOrdered { get; set; }
    
    /// <summary>
    /// Số lượng đã được dự trữ (auto-fulfilled từ inbound)
    /// </summary>
    public int QuantityReserved { get; set; }
    
    /// <summary>
    /// Số lượng còn cần chờ inbound
    /// </summary>
    public int QuantityPending => QuantityPreOrdered - QuantityReserved;
    
    public bool IsPreOrderVariant { get; set; }
}

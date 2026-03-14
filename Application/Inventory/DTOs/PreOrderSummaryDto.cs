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

/// <summary>
/// Báo cáo PreOrder tóm tắt — tất cả variant có PreOrder hoặc có demand chưa fulfill
/// </summary>
public sealed class PreOrderSummaryResponseDto
{
    /// <summary>
    /// Tổng số variant có PreOrder được bật
    /// </summary>
    public int TotalPreOrderVariants { get; set; }
    
    /// <summary>
    /// Tổng nhu cầu PreOrder (chưa fulfill toàn bộ)
    /// </summary>
    public int TotalPreOrderDemand { get; set; }
    
    /// <summary>
    /// Tổng đã fulfill từ inbound
    /// </summary>
    public int TotalFulfilledQuantity { get; set; }
    
    /// <summary>
    /// Tổng còn chờ inbound
    /// </summary>
    public int TotalPendingQuantity => TotalPreOrderDemand - TotalFulfilledQuantity;
    
    /// <summary>
    /// Chi tiết từng variant
    /// </summary>
    public List<PreOrderSummaryItemDto> Items { get; set; } = [];
}

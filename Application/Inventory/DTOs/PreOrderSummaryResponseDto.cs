namespace Application.Inventory.DTOs;

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

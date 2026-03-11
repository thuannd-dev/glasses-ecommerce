namespace Application.Inventory.DTOs;

/// <summary>
/// Báo cáo tình trạng tồn kho hiện tại toàn hệ thống.
/// </summary>
public sealed class InventoryStatusReportDto
{
    public int TotalSKUs { get; set; }
    public int TotalOnHand { get; set; }
    public int TotalAvailable { get; set; }
    public int LowStockCount { get; set; }
    public int OutOfStockCount { get; set; }
    public List<LowStockItemDto> LowStockItems { get; set; } = [];
}

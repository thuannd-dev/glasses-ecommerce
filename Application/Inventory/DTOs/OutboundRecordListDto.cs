namespace Application.Inventory.DTOs;
/// <summary>
/// Dto Response danh sách phiếu xuất kho (order-level, không bao gồm items chi tiết)
/// </summary>
public sealed class OutboundRecordListDto
{
    public Guid OrderId { get; set; }
    public string? OrderNumber { get; set; }
    public string? OrderStatus { get; set; }
    public string? CustomerName { get; set; }
    public int TotalItems { get; set; }
    public int TotalQuantity { get; set; }
    public DateTime RecordedAt { get; set; }
    public string? RecordedByName { get; set; }
}

namespace Application.Inventory.DTOs;
/// <summary>
/// Dto Response chi tiết phiếu xuất kho (order-level, bao gồm danh sách items)
/// </summary>
public sealed class OutboundRecordDto
{
    public Guid OrderId { get; set; }
    public string? OrderNumber { get; set; }
    public string? OrderStatus { get; set; }
    public string? CustomerName { get; set; }
    public int TotalItems { get; set; }
    public int TotalQuantity { get; set; }
    public DateTime RecordedAt { get; set; }
    public string? RecordedByName { get; set; }
    public List<OutboundRecordItemDto> Items { get; set; } = [];
}

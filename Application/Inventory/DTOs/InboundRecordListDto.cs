namespace Application.Inventory.DTOs;

//Dto Response danh sách phiếu nhập kho (lightweight, không có items)
public sealed class InboundRecordListDto
{
    public Guid Id { get; set; }
    public string? SourceType { get; set; }
    public string? SourceReference { get; set; }
    public string? Status { get; set; }
    public int TotalItems { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public string? CreatedByName { get; set; }
}

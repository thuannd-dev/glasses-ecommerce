namespace Application.Inventory.DTOs;

//Dto Response chi tiết phiếu nhập kho (bao gồm danh sách items)
public sealed class InboundRecordDto
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
    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedBy { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionReason { get; set; }
    public List<InboundRecordItemDto> Items { get; set; } = [];
}

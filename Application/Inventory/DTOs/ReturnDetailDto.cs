namespace Application.Inventory.DTOs;

/// <summary>
/// DTO response cho chi tiết phiếu hoàn hàng (từ InboundRecord hoặc AfterSalesTicket)
/// </summary>
public sealed class ReturnDetailDto
{
    // Common fields
    public Guid Id { get; set; }
    public string ReturnSourceType { get; set; } = null!; // "InboundRecord" or "Ticket"
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedByName { get; set; }
    public List<ReturnItemDetailDto> Items { get; set; } = [];

    // InboundRecord-specific fields (nullable for Ticket cases)
    public string? SourceType { get; set; }
    public string? SourceReference { get; set; }
    public string? Notes { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionReason { get; set; }

    // Ticket-specific fields (nullable for InboundRecord cases)
    public string? CustomerName { get; set; }
    public string? OrderNumber { get; set; }
    public string? Reason { get; set; }
    public string? ResolutionType { get; set; }
    public string? TicketType { get; set; }
    public Guid? OrderId { get; set; }
}

using Domain;

namespace Application.AfterSales.DTOs;
/// <summary>
/// Dto output cho danh sách ticket (paginated list row)
/// </summary>
public sealed class TicketListDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid? OrderItemId { get; set; }
    public AfterSalesTicketType TicketType { get; set; }
    public AfterSalesTicketStatus TicketStatus { get; set; }
    public string Reason { get; set; } = null!;
    public decimal? RefundAmount { get; set; }
    public bool IsRequiredEvidence { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}

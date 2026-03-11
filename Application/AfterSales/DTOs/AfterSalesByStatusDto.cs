namespace Application.AfterSales.DTOs;

/// <summary>
/// Thống kê ticket theo trạng thái hiện tại (TicketStatus).
/// </summary>
public sealed class AfterSalesByStatusDto
{
    public string Status { get; set; } = null!;
    public int Count { get; set; }
}

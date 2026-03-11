namespace Application.AfterSales.DTOs;

/// <summary>
/// Thống kê ticket theo phân loại (TicketType).
/// </summary>
public sealed class AfterSalesByTypeDto
{
    public string TicketType { get; set; } = null!;
    public int Count { get; set; }
    public decimal TotalRefundAmount { get; set; }
}

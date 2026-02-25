using Domain;

namespace Application.Orders.DTOs;

//Dto Response cho báo cáo doanh thu — filter theo OrderSource và khoảng thời gian
public sealed class RevenueReportDto
{
    public string? OrderSource { get; set; } // "Online", "Offline", or "All"
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }

    public int TotalOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int CancelledOrders { get; set; }

    public decimal TotalRevenue { get; set; }
    public decimal TotalDiscount { get; set; }
    public decimal NetRevenue { get; set; }

    public List<RevenueBySourceDto> BySource { get; set; } = [];
}

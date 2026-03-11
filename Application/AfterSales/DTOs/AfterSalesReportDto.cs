namespace Application.AfterSales.DTOs;

/// <summary>
/// Báo cáo tổng thể về hoạt động Hậu mãi -  hoạt động chăm sóc, hỗ trợ khách hàng sau khi giao dịch mua bán hoàn tất (After-Sales).
/// </summary>
public sealed record AfterSalesReportDto
{
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
    public double ResolutionRate { get; set; }
    public List<AfterSalesByTypeDto> ByType { get; set; } = [];
    public List<AfterSalesByStatusDto> ByStatus { get; set; } = [];
}

namespace Application.Orders.DTOs;

/// <summary>
/// Báo cáo tổng hợp doanh số theo từng Variant (Top-Selling Products).
/// </summary>
public sealed class TopProductsReportDto
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int TopN { get; set; }
    public List<TopProductItemDto> Items { get; set; } = [];
}

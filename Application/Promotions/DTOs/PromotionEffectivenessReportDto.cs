namespace Application.Promotions.DTOs;

/// <summary>
/// Báo cáo thống kê hiệu năng, độ phủ, và tổng chi phí của các chương trình khuyến mãi.
/// </summary>
public sealed class PromotionEffectivenessReportDto
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public List<PromotionEffectivenessItemDto> Items { get; set; } = [];
}

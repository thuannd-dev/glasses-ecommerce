namespace Application.Promotions.DTOs;

/// <summary>
/// Đại diện cho một dòng báo cáo hiệu quả của một chương trình khuyến mãi cụ thể.
/// </summary>
public sealed class PromotionEffectivenessItemDto
{
    public Guid PromotionId { get; set; }
    public string PromoCode { get; set; } = null!;
    public string PromoName { get; set; } = null!;
    public string PromotionType { get; set; } = null!;
    public decimal DiscountValue { get; set; }
    public int UsageCount { get; set; }
    public decimal TotalDiscountApplied { get; set; }
    public bool IsActive { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
}

using Domain;

namespace Application.Promotions.DTOs;
/// <summary>
/// Summary DTO returned in paged promotion list
/// </summary>
public sealed class PromotionListDto
{
    public Guid Id { get; set; }
    public string PromoCode { get; set; } = string.Empty;
    public string PromoName { get; set; } = string.Empty;
    public PromotionType PromotionType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MaxDiscountValue { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public bool IsActive { get; set; }
    public bool IsPublic { get; set; }
    public int UsedCount { get; set; }
}

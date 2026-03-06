using Domain;

namespace Application.Promotions.DTOs;
///<summary>
///Full detail DTO returned for single promotion (includes usage limits + description)
///</summary>
public sealed class PromotionDetailDto
{
    public Guid Id { get; set; }
    public string PromoCode { get; set; } = string.Empty;
    public string PromoName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PromotionType PromotionType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MaxDiscountValue { get; set; }
    public int? UsageLimit { get; set; }
    public int? UsageLimitPerCustomer { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public bool IsActive { get; set; }
    public bool IsPublic { get; set; }
    public int UsedCount { get; set; }
}

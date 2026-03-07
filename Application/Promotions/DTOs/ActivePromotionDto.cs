using Domain;

namespace Application.Promotions.DTOs;
///<summary>
///Public DTO returned in GET /api/promotions/active
///Excludes sensitive internal fields like UsageLimit, UsageLimitPerCustomer, UsedCount, IsActive, IsPublic
///</summary>
public sealed class ActivePromotionDto
{
    public Guid Id { get; set; }
    public string PromoCode { get; set; } = string.Empty;
    public string PromoName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PromotionType PromotionType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MaxDiscountValue { get; set; }
    public DateTime ValidTo { get; set; }
}

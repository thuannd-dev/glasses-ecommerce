using Domain;

namespace Application.Promotions.DTOs;
///<summary>    
///Input DTO for creating a new promotion
///</summary>
public sealed class CreatePromotionDto
{
    public required string PromoCode { get; set; }
    public required string PromoName { get; set; }
    public string? Description { get; set; }
    public PromotionType PromotionType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MaxDiscountValue { get; set; }
    public int? UsageLimit { get; set; }
    public int? UsageLimitPerCustomer { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public bool IsPublic { get; set; } = false;
}

namespace Application.Promotions.DTOs;
///<summary>
///Input DTO for updating a promotion — PromoCode excluded (immutable after creation)
///</summary>
public sealed class UpdatePromotionDto
{
    public required string PromoName { get; set; }
    public string? Description { get; set; }
    public decimal? MaxDiscountValue { get; set; }
    public int? UsageLimit { get; set; }
    public int? UsageLimitPerCustomer { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public bool IsActive { get; set; }
    public bool IsPublic { get; set; }
}

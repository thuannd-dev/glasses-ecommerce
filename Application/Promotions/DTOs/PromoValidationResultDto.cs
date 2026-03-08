namespace Application.Promotions.DTOs;
///<summary>
///Output DTO returned by the validate promo code endpoint — always 200, IsValid indicates success/failure
///</summary>
public sealed class PromoValidationResultDto
{
    public bool IsValid { get; set; }
    public string? Error { get; set; }
    public decimal DiscountApplied { get; set; }
    public string? PromotionType { get; set; }
    public string? PromoName { get; set; }
}

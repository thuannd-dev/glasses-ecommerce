namespace Application.Promotions.DTOs;
///<summary>
///Input DTO for validating a promo code before checkout (discount preview)
///</summary>
public sealed class ValidatePromoCodeDto
{
    public required string PromoCode { get; set; }
    public required decimal OrderTotal { get; set; }
    public decimal ShippingFee { get; set; } = 0;
}

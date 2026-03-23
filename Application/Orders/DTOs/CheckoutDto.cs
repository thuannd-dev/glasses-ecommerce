using Domain;

namespace Application.Orders.DTOs;
//Input DTO — items lấy từ cart, chỉ cần address/payment/promo
public sealed class CheckoutDto
{
    public required List<Guid> SelectedCartItemIds { get; set; }
    public required Guid AddressId { get; set; }
    
    // Required properties for GHN shipping fee calculation securely on backend
    public required int DistrictId { get; set; }
    public required string WardCode { get; set; }
    
    public required OrderType OrderType { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cod;
    public string? PromoCode { get; set; }
    public string? CustomerNote { get; set; }
    public List<OrderItemPrescriptionDto>? Prescriptions { get; set; }
}

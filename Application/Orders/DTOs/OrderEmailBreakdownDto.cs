namespace Application.Orders.DTOs;

/// Dto để gửi thông tin chi tiết đơn hàng trong email
public sealed class OrderEmailBreakdownDto
{
    public decimal SubtotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal FinalAmount { get; set; }
}

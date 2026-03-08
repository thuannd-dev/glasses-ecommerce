namespace Application.Orders.DTOs;

//Dto Response cho thông tin thanh toán (dùng chung cho staff và customer)
public sealed class OrderPaymentDto
{
    public Guid Id { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentStatus { get; set; }
    public decimal Amount { get; set; }
    public DateTime? PaymentAt { get; set; }
}

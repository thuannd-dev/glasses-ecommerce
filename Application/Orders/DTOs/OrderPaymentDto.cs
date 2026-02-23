namespace Application.Orders.DTOs;

public sealed class OrderPaymentDto
{
    public Guid Id { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentStatus { get; set; }
    public decimal Amount { get; set; }
    public DateTime? PaymentAt { get; set; }
}

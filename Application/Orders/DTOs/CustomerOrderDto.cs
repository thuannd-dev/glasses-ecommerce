namespace Application.Orders.DTOs;
//Detail DTO (không có fields staff)
public sealed class CustomerOrderDto
{
    public Guid Id { get; set; }
    public string? OrderSource { get; set; }
    public string? OrderType { get; set; }
    public string? OrderStatus { get; set; }

    public decimal TotalAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal FinalAmount { get; set; }
    public decimal? DiscountApplied { get; set; }

    public string? CustomerNote { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Nested
    public List<OrderItemOutputDto> Items { get; set; } = [];
    public OrderPaymentDto? Payment { get; set; }
    public OrderPrescriptionDto? Prescription { get; set; }
}

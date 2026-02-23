namespace Application.Orders.DTOs;

public sealed class OrderItemInputDto
{
    public required Guid ProductVariantId { get; set; }
    public required int Quantity { get; set; }
}

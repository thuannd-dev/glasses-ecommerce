namespace Application.Orders.DTOs;

//Dto Request cho item trong đơn hàng (productVariantId + quantity)
public sealed class OrderItemInputDto
{
    public required Guid ProductVariantId { get; set; }
    public required int Quantity { get; set; }
}

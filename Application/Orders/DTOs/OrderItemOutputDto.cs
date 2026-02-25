namespace Application.Orders.DTOs;

//Dto Response cho thông tin item trong đơn hàng (dùng chung cho staff và customer)
public sealed class OrderItemOutputDto
{
    public Guid Id { get; set; }
    public Guid ProductVariantId { get; set; }
    public string? Sku { get; set; }
    public string? VariantName { get; set; }
    public string? ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

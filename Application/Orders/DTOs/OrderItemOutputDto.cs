namespace Application.Orders.DTOs;

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

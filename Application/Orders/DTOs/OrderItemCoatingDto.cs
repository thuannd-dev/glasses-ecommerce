namespace Application.Orders.DTOs;

/// <summary>
/// Represents a coating option snapshot for an order item, capturing the coating details at the time of purchase.
/// </summary>
public sealed class OrderItemCoatingDto
{
    public Guid Id { get; set; }
    public string CoatingName { get; set; } = null!;
    public decimal Price { get; set; }
}

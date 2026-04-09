namespace Application.Orders.DTOs;

public sealed class OrderItemCoatingDto
{
    public Guid Id { get; set; }
    public string CoatingName { get; set; } = null!;
    public decimal Price { get; set; }
}

using System;

namespace Domain;

public class OrderStatusHistory
{
    public string Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow()).ToString();

    public required string OrderId { get; set; }
    public OrderStatus FromStatus { get; set; }

    public OrderStatus ToStatus { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Order Order { get; set; } = null!;

}

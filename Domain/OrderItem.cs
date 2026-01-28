using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

public class OrderItem
{
    public string Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow()).ToString();

    public required string OrderId { get; set; }

    public required string ProductVariantId { get; set; }

    public required int Quantity { get; set; }

    public required decimal UnitPrice { get; set; }

    // Navigation properties
    public Order Order { get; set; } = null!;
    public ProductVariant ProductVariant { get; set; } = null!;
    public ICollection<AfterSalesTicket> AfterSalesTickets { get; set; } = [];

    // Computed property (not mapped to DB)
    public decimal TotalPrice => Quantity * UnitPrice;
}

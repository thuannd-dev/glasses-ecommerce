using System;

namespace Domain;

public class CartItem
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required Guid CartId { get; set; }

    public required Guid ProductVariantId { get; set; }

    public required int Quantity { get; set; }

    // Navigation properties
    public Cart Cart { get; set; } = null!;
    public ProductVariant ProductVariant { get; set; } = null!;
}

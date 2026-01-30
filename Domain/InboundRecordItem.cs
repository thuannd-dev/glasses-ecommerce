using System;

namespace Domain;

public class InboundRecordItem
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required Guid InboundRecordId { get; set; }

    public required Guid ProductVariantId { get; set; }

    public required int Quantity { get; set; }

    public string? Notes { get; set; }

    // Navigation properties
    public InboundRecord InboundRecord { get; set; } = null!;
    public ProductVariant ProductVariant { get; set; } = null!;
}

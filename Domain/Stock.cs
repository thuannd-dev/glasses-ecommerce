using System;

namespace Domain;

public class Stock
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    public required Guid ProductVariantId { get; set; }

    public required int QuantityOnHand { get; set; }

    public required int QuantityReserved { get; set; }

    public int QuantityAvailable { get; private set; }

    /// <summary>
    /// Tổng số lượng đã được khách đặt trước (PreOrder) nhưng chưa có hàng trong kho.
    /// Dùng để tracking demand — khi hàng về qua Inbound sẽ fulfill dựa vào field này.
    /// </summary>
    public int QuantityPreOrdered { get; set; } = 0;

    public string? Notes { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Guid? UpdatedBy { get; set; }

    // Navigation properties
    public ProductVariant ProductVariant { get; set; } = null!;

    public User? UpdatedByUser { get; set; }

}

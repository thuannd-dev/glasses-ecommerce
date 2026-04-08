using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

public class OrderItem
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    public required Guid OrderId { get; set; }

    /// <summary>Frame variant được order.</summary>
    public required Guid ProductVariantId { get; set; }
    public required int Quantity { get; set; }

    /// <summary>Giá frame tại thời điểm đặt hàng (snapshot).</summary>
    public required decimal UnitPrice { get; set; }

    // ── Lens snapshot (null = gọng trần) ────────────────────────
    /// <summary>Lens variant được chọn kèm. Null nếu gọng trần.</summary>
    public Guid? LensVariantId { get; set; }

    /// <summary>Giá tròng kính tại thời điểm đặt hàng (snapshot). 0 nếu không có tròng.</summary>
    public decimal LensUnitPrice { get; set; } = 0;

    // ── Coating snapshot (immutable audit) ───────────────────────
    /// <summary>
    /// JSON snapshot các coating được chọn tại thời điểm order.
    /// Format: [{"id":"...","name":"UV Protection","price":100000}]
    /// Null nếu không chọn coating.
    /// </summary>
    public string? CoatingsSnapshot { get; set; }

    /// <summary>Tổng giá coating tại thời điểm đặt hàng (snapshot).</summary>
    public decimal CoatingExtraPrice { get; set; } = 0;

    // ── Navigation ───────────────────────────────────────────────
    public Order Order { get; set; } = null!;
    public ProductVariant ProductVariant { get; set; } = null!;

    /// <summary>Lens variant navigation. Null nếu gọng trần.</summary>
    public ProductVariant? LensVariant { get; set; }

    public ICollection<AfterSalesTicket> AfterSalesTickets { get; set; } = [];

    public Guid? PrescriptionId { get; set; }
    public Prescription? Prescription { get; set; }

    // ── Computed (not mapped to DB) ──────────────────────────────
    /// <summary>
    /// Subtotal pre-discount cho order item này.
    /// Discount xử lý ở Order level qua PromoUsageLog.
    /// </summary>
    [NotMapped]
    public decimal TotalPrice => Quantity * (UnitPrice + LensUnitPrice + CoatingExtraPrice);
}


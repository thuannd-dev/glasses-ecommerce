using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

public class PromoUsageLog
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required Guid OrderId { get; set; }

    public required Guid PromotionId { get; set; }

    public required decimal DiscountApplied { get; set; }

    public DateTime UsedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Order Order { get; set; } = null!;
    public Promotion Promotion { get; set; } = null!;
}

using System;

namespace Domain;

public class PromoUsageLog
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required Guid OrderId { get; set; }

    public required Guid PromotionId { get; set; }

    // Nullable: walk-in offline customers have no UserId (staff applies promo with dto.UserId == null)
    public Guid? UsedBy { get; set; }

    public required decimal DiscountApplied { get; set; }

    public DateTime UsedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Order Order { get; set; } = null!;
    public Promotion Promotion { get; set; } = null!;
    public User? User { get; set; } // nullable to match nullable FK
}

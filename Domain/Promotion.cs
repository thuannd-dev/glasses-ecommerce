using System;

namespace Domain;

public enum PromotionType
{
    Percentage = 0,
    FixedAmount = 1,
    FreeShipping = 2
}

public class Promotion
{
    public string Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow()).ToString();
    public required string PromoCode { get; set; }
    public required string PromoName { get; set; }
    public string? Description { get; set; }

    public PromotionType PromotionType { get; set; } // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING

    public decimal DiscountValue { get; set; }
    public decimal? MaxDiscountValue { get; set; }

    public int? UsageLimit { get; set; }

    public int? UsageLimitPerCustomer { get; set; }

    public DateTime ValidFrom { get; set; }

    public DateTime ValidTo { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<PromoUsageLog> UsageLogs { get; set; } = [];
}

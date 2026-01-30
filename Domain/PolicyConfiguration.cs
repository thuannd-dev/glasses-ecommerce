using System;

namespace Domain;

public enum PolicyType
{
    Unknown = 0,
    Return = 1,
    Warranty = 2,
    Refund = 3
}

public class PolicyConfiguration
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    public PolicyType PolicyType { get; set; } // RETURN, WARRANTY, REFUND
    public required string PolicyName { get; set; }

    public int? ReturnWindowDays { get; set; }

    public int? WarrantyMonths { get; set; }

    public bool RefundAllowed { get; set; } = true;

    public bool CustomizedLensRefundable { get; set; } = false;

    public bool EvidenceRequired { get; set; } = true;

    public decimal? MinOrderAmount { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime EffectiveFrom { get; set; }

    public DateTime? EffectiveTo { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime? DeletedAt { get; set; }

    public Guid? DeletedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? CreatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Guid? UpdatedBy { get; set; }

    // Navigation properties
    public User? Creator { get; set; }
    public User? Updater { get; set; }
    public User? Deleter { get; set; }

}

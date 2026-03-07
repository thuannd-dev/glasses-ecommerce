using System;

namespace Application.Policies.DTOs;

/// <summary>
/// DTO used for updating an existing policy configuration
/// </summary>
public sealed class UpdatePolicyDto
{
    public string PolicyName { get; set; } = null!;

    public int? ReturnWindowDays { get; set; }

    public int? WarrantyMonths { get; set; }

    public bool RefundAllowed { get; set; }

    public bool CustomizedLensRefundable { get; set; }

    public bool EvidenceRequired { get; set; }
    
    public decimal? MinOrderAmount { get; set; }

    public bool IsActive { get; set; }

    public DateTime EffectiveFrom { get; set; }

    public DateTime? EffectiveTo { get; set; }
}

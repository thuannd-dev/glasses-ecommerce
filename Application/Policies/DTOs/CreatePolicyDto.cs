using System;
using Domain;

namespace Application.Policies.DTOs;

/// <summary>
/// DTO used for creating a new policy configuration
/// </summary>
public sealed class CreatePolicyDto
{
    public PolicyType PolicyType { get; set; }

    public string PolicyName { get; set; } = null!;

    public int? ReturnWindowDays { get; set; }

    public int? WarrantyMonths { get; set; }

    public bool RefundAllowed { get; set; } = true;

    public bool CustomizedLensRefundable { get; set; } = false;

    public bool EvidenceRequired { get; set; } = true;

    public decimal? MinOrderAmount { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime EffectiveFrom { get; set; }

    public DateTime? EffectiveTo { get; set; }
}

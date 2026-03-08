using System;
using Domain;

namespace Application.Policies.DTOs;

/// <summary>
/// Summary DTO returned for public active policies list. Hides audit fields.
/// </summary>
public sealed class ActivePolicyDto
{
    public Guid Id { get; set; }
    public PolicyType PolicyType { get; set; }
    public string PolicyName { get; set; } = null!;
    public int? ReturnWindowDays { get; set; }
    public int? WarrantyMonths { get; set; }
    public bool RefundAllowed { get; set; }
    public bool CustomizedLensRefundable { get; set; }
    public bool EvidenceRequired { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}

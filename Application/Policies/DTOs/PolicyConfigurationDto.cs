using System;
using Domain;

namespace Application.Policies.DTOs;

/// <summary>
/// Summary DTO returned in paged policy list and details
/// </summary>
public sealed class PolicyConfigurationDto
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
    public decimal? RefundOnlyMaxAmount { get; set; }
    public int? RefundWindowDays { get; set; }
    public bool IsActive { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
}

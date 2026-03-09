namespace Application.FeatureToggles.DTOs;
/// <summary>
/// DTO for a feature toggle. Contains all relevant information about a feature toggle, including its unique identifier, name, enabled state, description, effective dates, scope, and metadata such as creation and update timestamps. This DTO is used to transfer feature toggle data between the application and clients, providing a comprehensive view of the feature toggle's configuration and status.
/// </summary>
public sealed class FeatureToggleDto
{
    public Guid Id { get; set; }
    public string FeatureName { get; set; } = null!;
    public bool IsEnabled { get; set; }
    public string? Description { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public string? Scope { get; set; }
    public string? ScopeValue { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public bool IsEffectivelyActive { get; set; }
}

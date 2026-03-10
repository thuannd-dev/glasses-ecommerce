namespace Application.FeatureToggles.DTOs;
/// <summary>
/// Request DTO for updating an existing feature toggle. Contains all necessary information to update a feature toggle, including its name, enabled state, description, effective dates, and scope. This DTO is used when a client wants to update the configuration of an existing feature toggle in the system.
/// </summary>
public sealed class UpdateFeatureToggleDto
{
    public required string FeatureName { get; set; }
    public bool IsEnabled { get; set; }
    public string? Description { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public string? Scope { get; set; }
    public string? ScopeValue { get; set; }
}

namespace Application.FeatureToggles.DTOs;
/// <summary>
/// DTO for creating a new feature toggle. Contains all necessary information to define a feature toggle, including its name, initial enabled state, description, effective dates, and scope. This DTO is used when a client wants to create a new feature toggle in the system.
/// </summary>
public sealed class CreateFeatureToggleDto
{
    public required string FeatureName { get; set; }
    public bool IsEnabled { get; set; } = true;
    public string? Description { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public string? Scope { get; set; }
    public string? ScopeValue { get; set; }
}

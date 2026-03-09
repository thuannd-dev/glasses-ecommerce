namespace Application.FeatureToggles.DTOs;
/// <summary>
/// DTO for enabling or disabling a feature toggle. Contains a single property, IsEnabled, which indicates whether the feature toggle should be enabled or disabled. This DTO is used when a client wants to change the enabled state of an existing feature toggle in the system.
/// </summary>
public sealed class SetFeatureToggleEnabledDto
{
    public bool IsEnabled { get; set; }
}

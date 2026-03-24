namespace Application.Accounts.DTOs;

/// <summary>
/// Request DTO for updating user display name.
/// </summary>
public sealed class UpdateDisplayNameDto
{
    public required string DisplayName { get; set; }
}

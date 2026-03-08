namespace Application.Admin.DTOs;

/// <summary>
/// DTO for user role response
/// </summary>
public sealed class UserRoleDto
{
    public required Guid UserId { get; set; }
    public required string UserName { get; set; }
    public required string Email { get; set; }
    public required string DisplayName { get; set; }
    public required List<string> Roles { get; set; }
}

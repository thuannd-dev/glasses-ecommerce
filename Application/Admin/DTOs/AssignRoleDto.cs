namespace Application.Admin.DTOs;

/// <summary>
/// DTO for assigning roles to a user
/// </summary>
public sealed class AssignRoleDto
{
    public required Guid UserId { get; set; }
    public required List<string> Roles { get; set; }
}

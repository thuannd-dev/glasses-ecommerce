namespace Application.Admin.DTOs;

/// <summary>
/// DTO for role list response
/// </summary>
public sealed class RoleDto
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public int UserCount { get; set; }
}

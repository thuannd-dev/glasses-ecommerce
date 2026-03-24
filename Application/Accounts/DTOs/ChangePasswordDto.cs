namespace Application.Accounts.DTOs;

/// <summary>
/// DTO Request để đổi mật khẩu
/// </summary>
public sealed class ChangePasswordDto
{
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
    public required string ConfirmPassword { get; set; }
}

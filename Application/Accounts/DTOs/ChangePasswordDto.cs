//DTO Request để đổi mật khẩu
namespace Application.Accounts.DTOs;

public sealed class ChangePasswordDto
{
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
    public required string ConfirmPassword { get; set; }
}

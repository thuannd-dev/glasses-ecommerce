//DTO Request để reset mật khẩu
namespace Application.Accounts.DTOs;

public sealed class ResetPasswordDto
{
    public required string Email { get; set; }
    public required string Token { get; set; }
    public required string NewPassword { get; set; }
    public required string ConfirmPassword { get; set; }
}

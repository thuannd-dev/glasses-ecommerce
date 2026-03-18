//DTO Request để gửi yêu cầu quên mật khẩu
namespace Application.Accounts.DTOs;

public sealed class ForgotPasswordDto
{
    public required string Email { get; set; }
}

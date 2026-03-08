namespace Application.AfterSales.DTOs;
/// <summary>
/// Dto Request để Operations Staff kiểm tra hàng trả về sau khi nhận
/// </summary>
public sealed class InspectReturnDto
{
    public required bool IsAccepted { get; set; }
    public required string Notes { get; set; }
}

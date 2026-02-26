namespace Application.Orders.DTOs;

//Dto Response lịch sử trạng thái đơn hàng
public sealed class OrderStatusHistoryDto
{
    public string FromStatus { get; set; } = null!;
    public string ToStatus { get; set; } = null!;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

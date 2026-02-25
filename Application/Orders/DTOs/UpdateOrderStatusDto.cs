using Domain;

namespace Application.Orders.DTOs;

//Dto Request để staff cập nhật trạng thái đơn hàng
public sealed class UpdateOrderStatusDto
{
    public required OrderStatus NewStatus { get; set; }
    public string? Notes { get; set; }
}

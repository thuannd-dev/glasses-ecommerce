namespace Application.Orders.DTOs;

//Dto Request để customer hủy đơn hàng — chứa lý do hủy (optional)
public sealed class CancelMyOrderDto
{
    public string? Reason { get; set; }
}

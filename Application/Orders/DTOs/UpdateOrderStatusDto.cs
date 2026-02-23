using Domain;

namespace Application.Orders.DTOs;

public sealed class UpdateOrderStatusDto
{
    public required OrderStatus NewStatus { get; set; }
    public string? Notes { get; set; }
}

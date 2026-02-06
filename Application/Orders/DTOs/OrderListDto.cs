using Domain;

namespace Application.Orders.DTOs;

public sealed class OrderListDto
{
    public required Guid Id { get; set; }
    public required string OrderNumber { get; set; }
    public required string CustomerEmail { get; set; }
    public required string CustomerName { get; set; }
    public required decimal TotalAmount { get; set; }
    public required OrderType OrderType { get; set; }
    public required OrderStatus OrderStatus { get; set; }
    public required DateTime CreatedAt { get; set; }
    public OrderSource OrderSource { get; set; } = OrderSource.Online;
    public int ItemCount { get; set; }
}

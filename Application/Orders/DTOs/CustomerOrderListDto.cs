namespace Application.Orders.DTOs;
//Lightweight list DTO

public sealed class CustomerOrderListDto
{
    public Guid Id { get; set; }
    public string? OrderType { get; set; }
    public string? OrderStatus { get; set; }

    public decimal TotalAmount { get; set; }
    public decimal FinalAmount { get; set; }

    public int ItemCount { get; set; }

    public DateTime CreatedAt { get; set; }
}

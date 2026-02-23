namespace Application.Orders.DTOs;

public sealed class StaffOrderListDto
{
    public Guid Id { get; set; }
    public string? OrderSource { get; set; }
    public string? OrderType { get; set; }
    public string? OrderStatus { get; set; }

    public decimal TotalAmount { get; set; }
    public decimal FinalAmount { get; set; }

    public string? WalkInCustomerName { get; set; }
    public string? WalkInCustomerPhone { get; set; }

    public Guid? CreatedBySalesStaff { get; set; }
    public string? SalesStaffName { get; set; }

    public int ItemCount { get; set; }

    public DateTime CreatedAt { get; set; }
}

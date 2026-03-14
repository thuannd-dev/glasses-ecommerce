namespace Application.Orders.DTOs;

//Dto Response danh sách đơn hàng cho staff (lightweight, không có items/payment)
public sealed class StaffOrderListDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string? OrderSource { get; set; }
    public string? OrderType { get; set; }
    public string? OrderStatus { get; set; }

    public decimal TotalAmount { get; set; }
    public decimal FinalAmount { get; set; }

    public string? WalkInCustomerName { get; set; }
    public string? WalkInCustomerPhone { get; set; }

    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }

    public string? ShippingAddress { get; set; }

    public Guid? CreatedBySalesStaff { get; set; }
    public string? SalesStaffName { get; set; }

    public int ItemCount { get; set; }

    public DateTime CreatedAt { get; set; }
    public string? ExpectedStockDate { get; set; }
    public string? PrescriptionStatus { get; set; }

    public Guid? ShipmentId { get; set; }
    public string? TrackingNumber { get; set; }
    public string? Carrier { get; set; }

    public List<StaffOrderItemDto> Items { get; set; } = [];
}

using System;

namespace Domain;

public enum OrderType
{
    Unknown = 0,
    ReadyStock = 1,
    PreOrder = 2,
    Prescription = 3
}

public enum OrderSource
{
    Unknown = 0,
    Online = 1,
    Offline = 2
}

public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Completed = 5,
    Cancelled = 6,
    Refunded = 7
}
public class Order
{
    public string Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow()).ToString();

    public required string AddressId { get; set; }

    public string? UserId { get; set; } // NULL for offline orders

    public string? CreatedBySalesStaff { get; set; }

    public required OrderType OrderType { get; set; } = OrderType.ReadyStock;

    public OrderSource OrderSource { get; set; } = OrderSource.Online; // Online, Offline

    public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending; // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, COMPLETED, CANCELLED, REFUNDED

    public required decimal TotalAmount { get; set; }

    public decimal ShippingFee { get; set; }

    public string? CustomerNote { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public decimal? DepositAmount { get; set; }

    public decimal? RemainingAmount { get; set; }

    public DateTime? CancellationDeadline { get; set; }

    // Navigation properties
    public Address Address { get; set; } = null!;

    public User? User { get; set; }

    public User? SalesStaff { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = [];
    public ICollection<OrderStatusHistory> StatusHistories { get; set; } = [];
    public Prescription? Prescription { get; set; }
    public ShipmentInfo? ShipmentInfo { get; set; }
    public ICollection<Payment> Payments { get; set; } = [];
    public ICollection<AfterSalesTicket> AfterSalesTickets { get; set; } = [];
    public ICollection<PromoUsageLog> PromoUsageLogs { get; set; } = [];

    // Computed method (not mapped to DB)
    public bool CanBeCancelled(DateTime now) => CalculateCanBeCancelled(now);

    private bool CalculateCanBeCancelled(DateTime now)
    {
        // Cannot cancel if shipment info exists
        if (ShipmentInfo != null)
            return false;

        return OrderType switch
        {
            OrderType.ReadyStock => true,
            OrderType.PreOrder => true, // Additional logic in service layer to check goods arrival
            OrderType.Prescription => CancellationDeadline.HasValue && now <= CancellationDeadline.Value,
            _ => false
        };
    }

    public decimal CalculateFinalAmount()
    {
        var discount = PromoUsageLogs?.Sum(x => x.DiscountApplied) ?? 0m;

        return TotalAmount + ShippingFee - discount;
    }

    // Business logic methods: applying promotion, không cho phép áp dụng nhiều promotion cùng lúc
    public void ApplyPromotion(PromoUsageLog log)
    {
        if (PromoUsageLogs.Count != 0)
            throw new InvalidOperationException("Order already has a promotion");

        PromoUsageLogs.Add(log);
    }
}

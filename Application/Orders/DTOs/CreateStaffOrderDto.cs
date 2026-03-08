using Domain;

namespace Application.Orders.DTOs;

//Dto Request để staff tạo đơn hàng (offline + on-behalf online)
public sealed class CreateStaffOrderDto
{
    public required OrderSource OrderSource { get; set; } // Online or Offline
    public required OrderType OrderType { get; set; } // ReadyStock, PreOrder, Prescription

    // On-behalf: link order to registered customer (optional)
    // If provided → validate address belongs to this user, order appears in customer's history
    // If null → walk-in customer, use WalkInCustomerName + WalkInCustomerPhone
    public Guid? UserId { get; set; }

    // Items
    public required List<OrderItemInputDto> Items { get; set; }

    // Walk-in customer info (optional, for offline or walk-in without account)
    public string? WalkInCustomerName { get; set; }
    public string? WalkInCustomerPhone { get; set; }

    // Shipping address (required for online/on-behalf orders)
    public Guid? AddressId { get; set; }

    // Payment
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

    // Optional
    public string? CustomerNote { get; set; }
    public string? PromoCode { get; set; }

    // Prescription (required if OrderType = Prescription)
    public PrescriptionInputDto? Prescription { get; set; }
}

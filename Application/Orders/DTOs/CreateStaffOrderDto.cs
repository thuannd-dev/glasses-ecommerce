using Domain;

namespace Application.Orders.DTOs;

public sealed class CreateStaffOrderDto
{
    public required OrderSource OrderSource { get; set; } // Online or Offline
    public required OrderType OrderType { get; set; } // ReadyStock, PreOrder, Prescription

    // Items
    public required List<OrderItemInputDto> Items { get; set; }

    // Walk-in customer info (optional, for offline)
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

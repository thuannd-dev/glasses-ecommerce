using System;
using Domain;

namespace Application.Orders.DTOs;

// --- Input DTOs (for creating orders) ---

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

public sealed class OrderItemInputDto
{
    public required Guid ProductVariantId { get; set; }
    public required int Quantity { get; set; }
}

public sealed class PrescriptionInputDto
{
    public required List<PrescriptionDetailInputDto> Details { get; set; }
}

public sealed class PrescriptionDetailInputDto
{
    public required EyeType Eye { get; set; }
    public decimal? SPH { get; set; }
    public decimal? CYL { get; set; }
    public int? AXIS { get; set; }
    public decimal? PD { get; set; }
    public decimal? ADD { get; set; }
}

// --- Output DTOs (for responses) ---

public sealed class StaffOrderDto
{
    public Guid Id { get; set; }
    public string? OrderSource { get; set; }
    public string? OrderType { get; set; }
    public string? OrderStatus { get; set; }

    public decimal TotalAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal FinalAmount { get; set; }
    public decimal? DiscountApplied { get; set; }

    public string? CustomerNote { get; set; }
    public string? WalkInCustomerName { get; set; }
    public string? WalkInCustomerPhone { get; set; }

    public Guid? CreatedBySalesStaff { get; set; }
    public string? SalesStaffName { get; set; }
    public Guid? UserId { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Nested
    public List<OrderItemOutputDto> Items { get; set; } = [];
    public OrderPaymentDto? Payment { get; set; }
    public OrderPrescriptionDto? Prescription { get; set; }
}

public sealed class OrderItemOutputDto
{
    public Guid Id { get; set; }
    public Guid ProductVariantId { get; set; }
    public string? Sku { get; set; }
    public string? VariantName { get; set; }
    public string? ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public sealed class OrderPaymentDto
{
    public Guid Id { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentStatus { get; set; }
    public decimal Amount { get; set; }
    public DateTime? PaymentAt { get; set; }
}

public sealed class OrderPrescriptionDto
{
    public Guid Id { get; set; }
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerificationNotes { get; set; }
    public List<PrescriptionDetailOutputDto> Details { get; set; } = [];
}

public sealed class PrescriptionDetailOutputDto
{
    public Guid Id { get; set; }
    public string? Eye { get; set; }
    public decimal? SPH { get; set; }
    public decimal? CYL { get; set; }
    public int? AXIS { get; set; }
    public decimal? PD { get; set; }
    public decimal? ADD { get; set; }
}

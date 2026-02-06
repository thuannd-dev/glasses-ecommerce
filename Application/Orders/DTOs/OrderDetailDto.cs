using Domain;

namespace Application.Orders.DTOs;

public sealed class OrderDetailDto
{
    public required Guid Id { get; set; }
    public required string OrderNumber { get; set; }
    public required string CustomerEmail { get; set; }
    public required string CustomerName { get; set; }
    public required string CustomerPhone { get; set; }
    public required AddressDto ShippingAddress { get; set; }
    public required decimal TotalAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public required OrderType OrderType { get; set; }
    public required OrderStatus OrderStatus { get; set; }
    public OrderSource OrderSource { get; set; } = OrderSource.Online;
    public string? CustomerNote { get; set; }
    public required DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public required List<OrderItemDetailDto> OrderItems { get; set; } = [];
    public PrescriptionDto? Prescription { get; set; }
}

public sealed class OrderItemDetailDto
{
    public required Guid Id { get; set; }
    public required Guid OrderItemId { get; set; }
    public required string ProductName { get; set; }
    public required string GlassModel { get; set; }
    public required string LensType { get; set; }
    public required int Quantity { get; set; }
    public required decimal UnitPrice { get; set; }
    public decimal TotalPrice => Quantity * UnitPrice;
}

public sealed class AddressDto
{
    public required string RecipientName { get; set; }
    public required string RecipientPhone { get; set; }
    public required string Venue { get; set; }
    public required string Ward { get; set; }
    public required string District { get; set; }
    public required string City { get; set; }
    public string? PostalCode { get; set; }
}

public sealed class PrescriptionDto
{
    public required Guid Id { get; set; }
    public bool IsVerified { get; set; }
    public required List<PrescriptionDetailDto> Details { get; set; } = [];
}

public sealed class PrescriptionDetailDto
{
    public EyeType Eye { get; set; }
    public decimal? SPH { get; set; }
    public decimal? CYL { get; set; }
    public int? AXIS { get; set; }
    public decimal? PD { get; set; }
    public decimal? ADD { get; set; }
}

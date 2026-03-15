using System;

namespace Application.Orders.DTOs;
/// <summary>
/// Input DTO for order items with prescription
/// </summary>
public sealed class OrderItemPrescriptionDto
{
    public required Guid CartItemId { get; set; }
    public required PrescriptionInputDto Prescription { get; set; }
}

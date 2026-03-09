using Domain;
using System.Collections.Generic;
using Application.Orders.DTOs;
using Application.Addresses.DTOs;

namespace Application.AfterSales.DTOs;
/// <summary>
/// Dto output chi tiết ticket bao gồm attachments
/// </summary>
public sealed class TicketDetailDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid? OrderItemId { get; set; }
    public OrderItemOutputDto? OrderItem { get; set; }
    public Guid CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public AddressDto? ShippingAddress { get; set; }
    public OrderPrescriptionDto? OrderPrescription { get; set; }
    public AfterSalesTicketType TicketType { get; set; }
    public AfterSalesTicketStatus TicketStatus { get; set; }
    public TicketResolutionType? ResolutionType { get; set; }
    public string Reason { get; set; } = null!;
    public string? RequestedAction { get; set; }
    public decimal? RefundAmount { get; set; }
    public bool IsRequiredEvidence { get; set; }
    public string? PolicyViolation { get; set; }
    public string? StaffNotes { get; set; }
    public Guid? AssignedTo { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReceivedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public List<TicketAttachmentDto> Attachments { get; set; } = [];
}

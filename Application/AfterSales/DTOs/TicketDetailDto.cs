using Application.Orders.DTOs;
using Domain;
using System.Collections.Generic;

namespace Application.AfterSales.DTOs;
/// <summary>
/// Dto output chi tiết ticket bao gồm attachments và order items
/// </summary>
public sealed class TicketDetailDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string? OrderType { get; set; }
    public Guid? OrderItemId { get; set; }
    public Guid CustomerId { get; set; }
    public AfterSalesTicketType TicketType { get; set; }
    // Non-null when ticket was auto-upgraded from its original type (e.g. Return → Refund)
    public AfterSalesTicketType? OriginalTicketType { get; set; }
    public AfterSalesTicketStatus TicketStatus { get; set; }
    public TicketResolutionType? ResolutionType { get; set; }
    public string Reason { get; set; } = null!;
    public string? RequestedAction { get; set; }
    public decimal? RefundAmount { get; set; }
    public decimal DiscountApplied { get; set; }
    public bool IsRequiredEvidence { get; set; }
    public string? PolicyViolation { get; set; }
    public string? StaffNotes { get; set; }
    public Guid? AssignedTo { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReceivedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public List<TicketAttachmentDto> Attachments { get; set; } = [];
    public List<OrderItemOutputDto> Items { get; set; } = [];
    public string? CustomerName { get; set; }
}

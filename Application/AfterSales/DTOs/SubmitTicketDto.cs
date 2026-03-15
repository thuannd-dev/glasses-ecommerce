using Domain;
using System.Collections.Generic;

namespace Application.AfterSales.DTOs;
/// <summary>
/// Dto Request để customer submit yêu cầu đổi/trả/bảo hành/hoàn tiền
/// </summary>
public sealed class SubmitTicketDto
{
    public required Guid OrderId { get; set; }
    /// <summary>
    /// List of order item IDs to include in the ticket. If null or empty, ticket is for whole order.
    /// </summary>
    public List<Guid>? OrderItemIds { get; set; }
    public required AfterSalesTicketType TicketType { get; set; }
    public required string Reason { get; set; }
    public string? RequestedAction { get; set; }
    public decimal? RefundAmount { get; set; }
    public List<TicketAttachmentInputDto> Attachments { get; set; } = [];
}

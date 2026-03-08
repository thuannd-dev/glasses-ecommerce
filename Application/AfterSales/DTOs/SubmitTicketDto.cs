using Domain;
using System.Collections.Generic;

namespace Application.AfterSales.DTOs;
/// <summary>
/// Dto Request để customer submit yêu cầu đổi/trả/bảo hành/hoàn tiền
/// </summary>
public sealed class SubmitTicketDto
{
    public required Guid OrderId { get; set; }
    public Guid? OrderItemId { get; set; }
    public required AfterSalesTicketType TicketType { get; set; }
    public required string Reason { get; set; }
    public string? RequestedAction { get; set; }
    public decimal? RefundAmount { get; set; }
    public List<TicketAttachmentInputDto> Attachments { get; set; } = [];
}

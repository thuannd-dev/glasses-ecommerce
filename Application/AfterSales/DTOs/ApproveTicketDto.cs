using Domain;

namespace Application.AfterSales.DTOs;
/// <summary>
/// Dto Request để Staff approve ticket và chọn resolution type
/// </summary>
public sealed class ApproveTicketDto
{
    public required TicketResolutionType ResolutionType { get; set; }
    public string? StaffNotes { get; set; }
    // Required when ResolutionType == RefundOnly
    public decimal? RefundAmount { get; set; }
}

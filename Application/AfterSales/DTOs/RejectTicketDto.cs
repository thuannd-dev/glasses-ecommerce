namespace Application.AfterSales.DTOs;
/// <summary>
/// Dto Request để Staff reject ticket kèm lý do
/// </summary>
public sealed class RejectTicketDto
{
    public required string Reason { get; set; }
}

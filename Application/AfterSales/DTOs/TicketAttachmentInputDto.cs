namespace Application.AfterSales.DTOs;
/// <summary>
/// Dto input for a single attachment when submitting a ticket
/// </summary>
public sealed class TicketAttachmentInputDto
{
    public required string FileName { get; set; }
    public required string FileUrl { get; set; }
    public string? FileExtension { get; set; }
}

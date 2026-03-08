namespace Application.AfterSales.DTOs;
/// <summary>
/// Dto output cho một attachment của ticket
/// </summary>
public sealed class TicketAttachmentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public string? FileExtension { get; set; }
    public DateTime CreatedAt { get; set; }
}

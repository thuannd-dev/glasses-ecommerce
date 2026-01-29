using System;

namespace Domain;

public class TicketAttachment
{
    public string Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow()).ToString();
    public required string TicketId { get; set; }
    public required string FileName { get; set; }
    public required string FileUrl { get; set; }
    public string? FileExtension { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DeletedAt { get; set; }

    public string? DeletedBy { get; set; }

    // Navigation properties
    public AfterSalesTicket Ticket { get; set; } = null!;

    public User? Deleter { get; set; }
}

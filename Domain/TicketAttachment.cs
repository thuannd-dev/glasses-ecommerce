using System;

namespace Domain;

public class TicketAttachment
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required Guid TicketId { get; set; }
    public required string FileName { get; set; }
    public required string FileUrl { get; set; }
    public string? FileExtension { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DeletedAt { get; set; }

    public Guid? DeletedBy { get; set; }
    // Navigation properties
    public AfterSalesTicket Ticket { get; set; } = null!;

    public User? Deleter { get; set; }
}

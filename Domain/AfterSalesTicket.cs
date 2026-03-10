using System;

namespace Domain;

public enum AfterSalesTicketType
{
    Unknown = 0,
    Return = 1,
    Warranty = 2,
    Refund = 3
}

public enum AfterSalesTicketStatus
{
    Pending = 1,
    InProgress = 2,
    Replacing = 3,    // Intermediate status for warranty replacement workflow
    Resolved = 4,
    Rejected = 5,
    Closed = 6,
    Cancelled = 7
}

public enum TicketResolutionType
{
    RefundOnly = 1,        // CASE A — Refund ticket, no physical return
    ReturnAndRefund = 2,   // CASE B — Return ticket, refund after Ops inspect
    WarrantyRepair = 3,    // CASE C — Warranty ticket, Ops repairs
    WarrantyReplace = 4    // CASE D — Warranty ticket, Ops replaces
}

public class AfterSalesTicket
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    public Guid? OrderId { get; set; }

    public Guid? OrderItemId { get; set; } // NULL if the ticket is for the whole order

    public required Guid CustomerId { get; set; }

    public AfterSalesTicketType TicketType { get; set; } = AfterSalesTicketType.Unknown; // RETURN, WARRANTY, REFUND

    public AfterSalesTicketStatus TicketStatus { get; set; } = AfterSalesTicketStatus.Pending; // PENDING, IN_PROGRESS, RESOLVED, REJECTED, CLOSED

    public required string Reason { get; set; } = null!;

    public string? RequestedAction { get; set; }

    public decimal? RefundAmount { get; set; }

    public bool IsRequiredEvidence { get; set; } = true;

    public Guid? AssignedTo { get; set; }

    public string? PolicyViolation { get; set; }

    // Set by Staff when approving — determines which Ops workflow to execute
    public TicketResolutionType? ResolutionType { get; set; }

    // Free-text notes added by Staff when approving or rejecting
    public string? StaffNotes { get; set; }

    // Set by Operations Staff when physical goods are received (CASE B, C, D)
    public DateTime? ReceivedAt { get; set; }

    // Set by Operations when selecting replacement item for warranty replacement (CASE D)
    public Guid? ReplacementProductVariantId { get; set; }

    // Flag to indicate ticket is awaiting replacement selection (for warranty replacement workflow)
    // Allows ticket to be visible in both Sales (InProgress section) and Operations (Replacing section)
    public bool IsAwaitingReplacement { get; set; } = false;

    // Flag to indicate replacement selection has been completed
    // Allows resolved replacement tickets to remain visible in Operations (Replacing section) with Resolved status
    public bool IsReplacementCompleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }

    // Navigation properties
    public Order Order { get; set; } = null!;
    public OrderItem? OrderItem { get; set; }
    public ProductVariant? ReplacementProductVariant { get; set; }
    public User Customer { get; set; } = null!;
    public User? AssignedStaff { get; set; }
    public ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();

}
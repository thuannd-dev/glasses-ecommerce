using System;

namespace Domain;

public enum RefundStatus
{
    Pending = 1,
    Approved = 2,
    Completed = 3,
    Rejected = 4
}

public class Refund
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    public required Guid PaymentId { get; set; }

    public RefundStatus RefundStatus { get; set; } = RefundStatus.Pending; // PENDING, APPROVED, COMPLETED, REJECTED

    public required decimal Amount { get; set; }

    public DateTime? RefundAt { get; set; }
    public string? RefundReason { get; set; }

    // Navigation property
    public Payment Payment { get; set; } = null!;

}

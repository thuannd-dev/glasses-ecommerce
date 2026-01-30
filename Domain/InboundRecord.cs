using System;

namespace Domain;

public enum SourceType
{
    Unknown = 0,
    Supplier = 1,
    Return = 2,
    Adjustment = 3
}

public enum InboundRecordStatus
{
    PendingApproval = 0,
    Approved = 1,
    Rejected = 2
}


public class InboundRecord
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    public SourceType SourceType { get; set; }// Supplier, Return, Adjustment

    public string? SourceReference { get; set; }// mã đơn đặt hàng với supplier, mã phiếu trả hàng

    public InboundRecordStatus Status { get; set; } = InboundRecordStatus.PendingApproval;// PENDING_APPROVAL, APPROVED, REJECTED

    public required int TotalItems { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? CreatedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public Guid? ApprovedBy { get; set; }

    public DateTime? RejectedAt { get; set; }

    public string? RejectionReason { get; set; }

    // Navigation properties
    public User? Creator { get; set; }
    public User? Approver { get; set; }
    public ICollection<InboundRecordItem> Items { get; set; } = [];
}

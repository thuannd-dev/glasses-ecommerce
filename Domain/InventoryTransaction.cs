using System;

namespace Domain;

public enum TransactionType
{
    Unknown = 0,
    Inbound = 1,
    Outbound = 2,
    Adjustment = 3
}

public enum ReferenceType
{
    Order = 1,
    Return = 2,
    Supplier = 3,
    Adjustment = 4
}

public enum InventoryTransactionStatus
{
    Pending = 0,
    Completed = 1,
}

public class InventoryTransaction
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    public required Guid UserId { get; set; }

    public required Guid ProductVariantId { get; set; }
    public TransactionType TransactionType { get; set; } = TransactionType.Inbound;

    public required int Quantity { get; set; }

    public ReferenceType ReferenceType { get; set; } = ReferenceType.Order;

    public Guid? ReferenceId { get; set; }

    public InventoryTransactionStatus Status { get; set; } = InventoryTransactionStatus.Pending;//Pending, Completed

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? CreatedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public Guid? ApprovedBy { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;

    public ProductVariant ProductVariant { get; set; } = null!;
    
    public User? Creator { get; set; }

    public User? Approver { get; set; }
}

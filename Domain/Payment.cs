using System;

namespace Domain;

public enum PaymentMethod
{
    Cod = 1,
    QrCode = 2,
    BankTransfer = 3
}

public enum PaymentStatus
{
    Pending = 1,
    Completed = 2,
    Failed = 3,
    Refunded = 4
}

public enum PaymentType
{
    Full = 1,
    Deposit = 2,
    Remaining = 3
}

public class Payment
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required Guid OrderId { get; set; }
    public PaymentMethod PaymentMethod { get; set; } // COD, QR_CODE, BANK_TRANSFER

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending; // PENDING, COMPLETED, FAILED, REFUNDED

    public required decimal Amount { get; set; }

    public string? TransactionId { get; set; }

    public DateTime? PaymentAt { get; set; }

    public PaymentType PaymentType { get; set; } = PaymentType.Full; //FULL, DEPOSIT, REMAINING

    // Navigation properties
    public Order Order { get; set; } = null!;

    public ICollection<Refund> Refunds { get; set; } = [];

}

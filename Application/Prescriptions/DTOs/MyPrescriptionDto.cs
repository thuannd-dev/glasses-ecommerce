using Application.Orders.DTOs;

namespace Application.Prescriptions.DTOs;
/// <summary>
/// Dto Response cho chi tiết đơn kính của customer (bao gồm từng mắt)
/// </summary>
public sealed class MyPrescriptionDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string? OrderType { get; set; }
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerificationNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PrescriptionDetailOutputDto> Details { get; set; } = [];
}

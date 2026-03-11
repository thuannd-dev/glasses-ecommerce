using Application.Orders.DTOs;

namespace Application.Prescriptions.DTOs;
/// <summary>
/// Dto Response cho chi tiết đơn kính dành cho Sales và Operations (bao gồm tên người xác nhận)
/// </summary>
public sealed class StaffPrescriptionDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string? OrderType { get; set; }
    public string? OrderStatus { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerificationNotes { get; set; }
    public string? VerifiedByName { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PrescriptionDetailOutputDto> Details { get; set; } = [];
}

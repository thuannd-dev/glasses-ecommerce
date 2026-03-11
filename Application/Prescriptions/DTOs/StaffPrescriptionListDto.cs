namespace Application.Prescriptions.DTOs;
/// <summary>
/// Dto Response cho 1 item trong danh sách đơn kính dành cho Sales và Operations
/// </summary>
public sealed class StaffPrescriptionListDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string? OrderType { get; set; }
    public string? OrderStatus { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public int DetailCount { get; set; }
}

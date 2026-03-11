namespace Application.Prescriptions.DTOs;
/// <summary>
/// Dto Response cho 1 item trong danh sách đơn kính của customer
/// </summary>
public sealed class PrescriptionListItemDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string? OrderType { get; set; }
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public int DetailCount { get; set; }
}

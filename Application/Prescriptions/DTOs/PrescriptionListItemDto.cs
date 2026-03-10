namespace Application.Prescriptions.DTOs;

//Dto Response cho 1 item trong danh sách đơn kính của customer
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

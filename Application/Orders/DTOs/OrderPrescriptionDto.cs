namespace Application.Orders.DTOs;

//Dto Response cho thông tin đơn thuốc (dùng chung cho staff và customer)
public sealed class OrderPrescriptionDto
{
    public Guid Id { get; set; }
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerificationNotes { get; set; }
    public List<PrescriptionDetailOutputDto> Details { get; set; } = [];
}

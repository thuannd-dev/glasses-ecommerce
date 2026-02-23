namespace Application.Orders.DTOs;

public sealed class OrderPrescriptionDto
{
    public Guid Id { get; set; }
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerificationNotes { get; set; }
    public List<PrescriptionDetailOutputDto> Details { get; set; } = [];
}

public sealed class PrescriptionDetailOutputDto
{
    public Guid Id { get; set; }
    public string? Eye { get; set; }
    public decimal? SPH { get; set; }
    public decimal? CYL { get; set; }
    public int? AXIS { get; set; }
    public decimal? PD { get; set; }
    public decimal? ADD { get; set; }
}

using Domain;

namespace Application.Orders.DTOs;

public sealed class PrescriptionInputDto
{
    public required List<PrescriptionDetailInputDto> Details { get; set; }
}

public sealed class PrescriptionDetailInputDto
{
    public required EyeType Eye { get; set; }
    public decimal? SPH { get; set; }
    public decimal? CYL { get; set; }
    public int? AXIS { get; set; }
    public decimal? PD { get; set; }
    public decimal? ADD { get; set; }
}

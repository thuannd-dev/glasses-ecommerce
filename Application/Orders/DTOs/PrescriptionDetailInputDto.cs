using Domain;

namespace Application.Orders.DTOs;

//Dto Request cho chi tiết từng mắt trong đơn thuốc (SPH, CYL, AXIS, PD, ADD)
public sealed class PrescriptionDetailInputDto
{
    public required EyeType Eye { get; set; }
    public decimal? SPH { get; set; }
    public decimal? CYL { get; set; }
    public int? AXIS { get; set; }
    public decimal? PD { get; set; }
    public decimal? ADD { get; set; }
}

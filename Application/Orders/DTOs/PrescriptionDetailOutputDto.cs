namespace Application.Orders.DTOs;

//Dto Response cho chi tiết từng mắt trong đơn thuốc trả về client
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

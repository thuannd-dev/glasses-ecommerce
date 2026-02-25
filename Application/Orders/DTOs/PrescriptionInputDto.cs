using Domain;

namespace Application.Orders.DTOs;

//Dto Request cho thông tin đơn thuốc khi tạo đơn hàng
public sealed class PrescriptionInputDto
{
    public required List<PrescriptionDetailInputDto> Details { get; set; }
}

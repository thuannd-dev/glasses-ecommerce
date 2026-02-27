using Domain;

namespace Application.Inventory.DTOs;

//Dto Request để tạo phiếu nhập kho
public sealed class CreateInboundDto
{
    public required SourceType SourceType { get; set; }
    public string? SourceReference { get; set; }
    public string? Notes { get; set; }
    public required List<InboundItemInputDto> Items { get; set; } = [];
}

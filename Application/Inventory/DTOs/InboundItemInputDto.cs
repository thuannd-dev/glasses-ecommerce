namespace Application.Inventory.DTOs;

//Dto Request cho từng item trong phiếu nhập kho
public sealed class InboundItemInputDto
{
    public required Guid ProductVariantId { get; set; }
    public required int Quantity { get; set; }
    public string? Notes { get; set; }
}

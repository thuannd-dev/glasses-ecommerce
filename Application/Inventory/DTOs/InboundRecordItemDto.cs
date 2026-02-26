namespace Application.Inventory.DTOs;

//Dto Response cho từng item trong phiếu nhập kho
public sealed class InboundRecordItemDto
{
    public Guid Id { get; set; }
    public Guid ProductVariantId { get; set; }
    public string? VariantName { get; set; }
    public string? SKU { get; set; }
    public int Quantity { get; set; }
    public string? Notes { get; set; }
}

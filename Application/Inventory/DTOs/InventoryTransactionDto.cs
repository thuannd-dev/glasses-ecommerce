namespace Application.Inventory.DTOs;

//Dto Response cho inventory transaction record
public sealed class InventoryTransactionDto
{
    public Guid Id { get; set; }
    public Guid ProductVariantId { get; set; }
    public string? VariantName { get; set; }
    public string? SKU { get; set; }
    public string? TransactionType { get; set; }
    public int Quantity { get; set; }
    public string? ReferenceType { get; set; }
    public Guid? ReferenceId { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedByName { get; set; }
}

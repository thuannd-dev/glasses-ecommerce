namespace Application.Orders.DTOs;

public sealed record OrderPickingListItemDto
{
    public required Guid OrderId { get; init; }
    
    public required string OrderNumber { get; init; }
    
    public required DateTime OrderDate { get; init; }
    
    public required string CustomerName { get; init; }
    
    public required decimal TotalAmount { get; init; }
    
    public required int TotalItems { get; init; }
    
    public required OrderItemPickDto[] Items { get; init; }
}

public sealed record OrderItemPickDto
{
    public required Guid OrderItemId { get; init; }
    
    public required Guid ProductVariantId { get; init; }
    
    public required string ProductName { get; init; }
    
    public required string VariantName { get; init; }
    
    public required int RequiredQuantity { get; init; }
    
    public required int AvailableStock { get; init; }
    
    public int PickedQuantity { get; set; }
    
    public string? Notes { get; set; }
}

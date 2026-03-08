namespace Application.Carts.DTOs;

public sealed class CartItemDto
{
    public Guid Id { get; set; }
    public Guid CartId { get; set; }
    public Guid ProductVariantId { get; set; }
    public int Quantity { get; set; }
    
    // ProductVariant details
    public string Sku { get; set; } = null!;
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public string? Color { get; set; }
    public string? Size { get; set; }
    public string? Material { get; set; }
    
    // Stock information
    public int QuantityAvailable { get; set; }
    public bool IsInStock { get; set; }
    
    // Product basic info
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? ProductImageUrl { get; set; }
    
    // Calculated fields
    public decimal Subtotal { get; set; }
}

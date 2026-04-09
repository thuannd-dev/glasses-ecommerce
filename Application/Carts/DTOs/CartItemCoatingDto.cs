namespace Application.Carts.DTOs;

/// <summary>
/// Represents a coating option selected for a cart item.
/// </summary>
public sealed class CartItemCoatingDto
{
    public Guid Id { get; set; }
    public string CoatingName { get; set; } = null!;
    public string? Description { get; set; }

    /// <summary>
    /// Giá mới nhất của coating. Có thể khác với CoatingExtraPrice 
    /// (giá được chốt tại thời điểm đưa vào giỏ hàng).
    /// </summary>
    public decimal CurrentExtraPrice { get; set; }
}

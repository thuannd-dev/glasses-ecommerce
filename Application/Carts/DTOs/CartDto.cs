namespace Application.Carts.DTOs;

public sealed class CartDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public ICollection<CartItemDto> Items { get; set; } = [];
    public int TotalItems { get; set; }
    public decimal TotalPrice { get; set; }
}

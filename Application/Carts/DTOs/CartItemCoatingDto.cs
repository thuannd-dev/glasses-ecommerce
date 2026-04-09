namespace Application.Carts.DTOs;

public sealed class CartItemCoatingDto
{
    public Guid   Id          { get; set; }
    public string CoatingName { get; set; } = null!;
    public string? Description { get; set; }
    public decimal ExtraPrice  { get; set; }
}

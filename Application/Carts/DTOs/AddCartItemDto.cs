namespace Application.Carts.DTOs;

//Dto Request để add item
public sealed class AddCartItemDto
{
    public required Guid ProductVariantId { get; set; }
    public required int Quantity { get; set; }
}

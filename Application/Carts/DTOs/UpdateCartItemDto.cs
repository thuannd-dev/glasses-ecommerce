namespace Application.Carts.DTOs;

//Dto Request để update quantity, ID được truyền qua route parameter
public sealed class UpdateCartItemDto
{
    public required int Quantity { get; set; }
}

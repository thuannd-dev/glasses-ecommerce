namespace Application.Products.DTOs;

public sealed class ProductImageDto
{
    public required Guid Id { get; set; }
    public required string ImageUrl { get; set; }
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; }
    public string? ModelUrl { get; set; }
}

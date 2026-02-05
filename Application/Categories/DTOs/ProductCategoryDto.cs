namespace Application.Categories.DTOs;

public sealed class ProductCategoryDto
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Description { get; set; }
}

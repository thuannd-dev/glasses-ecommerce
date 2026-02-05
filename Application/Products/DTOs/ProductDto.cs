using Application.Categories.DTOs;
using Domain;

namespace Application.Products.DTOs;

public sealed class ProductDto
{
    public required Guid Id { get; set; }
    public required string ProductName { get; set; }
    public required ProductType Type { get; set; }
    public string? Description { get; set; }
    public string? Brand { get; set; }
    public required ProductStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public required ProductCategoryDto Category { get; set; }
    public ICollection<ProductVariantDto> Variants { get; set; } = []; //Image for product variant
    public ICollection<ProductImageDto> Images { get; set; } = []; // Image for product
}

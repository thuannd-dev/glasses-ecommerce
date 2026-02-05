using Application.Categories.DTOs;
using Domain;

namespace Application.Products.DTOs;

//Product int list view
public sealed class ProductListDto
{
    public required Guid Id { get; set; }
    public required string ProductName { get; set; }
    public required ProductType Type { get; set; }
    public string? Brand { get; set; }
    public string? Description { get; set; }
    public decimal MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int TotalQuantityAvailable { get; set; }
    public ProductImageDto? FirstImage { get; set; }
    public required ProductCategoryDto Category { get; set; }
}

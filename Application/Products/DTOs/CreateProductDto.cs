using Domain;

namespace Application.Products.DTOs;
/// <summary>
/// DTO request để tạo mới một Product
/// </summary>
public sealed class CreateProductDto
{
    public required Guid CategoryId { get; set; }
    public required string ProductName { get; set; }
    public required ProductType Type { get; set; }
    public string? Description { get; set; }
    public string? Brand { get; set; }
    public ProductStatus Status { get; set; } = ProductStatus.Draft;
}

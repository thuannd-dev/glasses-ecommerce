namespace Application.Products.DTOs;

/// <summary>
/// DTO request để thêm product-level image (lifestyle/catalog image).
/// Upload file trước qua POST /api/uploads/image để lấy ImageUrl.
/// </summary>
public sealed class AddProductImageDto
{
    public required string ImageUrl { get; set; }
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public string? ModelUrl { get; set; }
}

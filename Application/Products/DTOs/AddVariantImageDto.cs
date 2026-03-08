namespace Application.Products.DTOs;

/// <summary>
/// DTO request để thêm variant-level image (ảnh màu sắc, góc chụp của variant cụ thể).
/// Upload file trước qua POST /api/uploads/image để lấy ImageUrl.
/// </summary>
public sealed class AddVariantImageDto
{
    public required string ImageUrl { get; set; }
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public string? ModelUrl { get; set; }
}

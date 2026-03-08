namespace Application.Products.DTOs;
/// <summary>
/// DTO request để sắp xếp lại thứ tự ảnh của một Product
/// Index trong list = DisplayOrder mới (0-indexed)
/// </summary>
public sealed class ReorderImagesDto
{
    public required List<Guid> ImageIds { get; set; }
}

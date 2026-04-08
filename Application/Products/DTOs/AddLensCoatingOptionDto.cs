namespace Application.Products.DTOs;

/// <summary>
/// DTO request để thêm một coating option vào Lens Product
/// </summary>
public sealed class AddLensCoatingOptionDto
{
    public required string CoatingName { get; set; }
    public string? Description { get; set; }
    public required decimal ExtraPrice { get; set; }
}

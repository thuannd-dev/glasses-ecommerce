namespace Application.Products.DTOs;

/// <summary>
/// DTO request để cập nhật một coating option hiện có
/// </summary>
public sealed class UpdateLensCoatingOptionDto
{
    public string? CoatingName { get; set; }
    public string? Description { get; set; }
    public decimal? ExtraPrice { get; set; }
    public bool? IsActive { get; set; }
}

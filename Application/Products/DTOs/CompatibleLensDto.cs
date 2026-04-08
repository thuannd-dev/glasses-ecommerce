namespace Application.Products.DTOs;

/// <summary>
/// Một Lens Product tương thích với frame, gồm danh sách variants phù hợp và coating options.
/// </summary>
public sealed class CompatibleLensDto
{
    public Guid LensProductId { get; set; }
    public string LensProductName { get; set; } = string.Empty;
    public string? Brand { get; set; }

    /// <summary>
    /// Các variants của lens product này còn lọc theo prescription của khách (nếu có).
    /// Empty list = không có variant nào phù hợp với toa của khách.
    /// </summary>
    public List<CompatibleLensVariantDto> Variants { get; set; } = [];

    /// <summary>Coating options active của lens product này.</summary>
    public List<LensCoatingOptionDto> CoatingOptions { get; set; } = [];
}

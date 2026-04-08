using Domain;

namespace Application.Products.DTOs;
/// <summary>
/// DTO request để set/update thông số quang học cho một Lens ProductVariant
/// </summary>
public sealed class UpsertLensVariantAttributeDto
{
    public required decimal SphMin { get; set; }
    public required decimal SphMax { get; set; }

    public required decimal CylMin { get; set; }
    public required decimal CylMax { get; set; }

    public int AxisMin { get; set; } = 0;
    public int AxisMax { get; set; } = 180;

    /// <summary>Chỉ dùng cho Progressive / Bifocal. Null với SingleVision.</summary>
    public decimal? AddMin { get; set; }
    public decimal? AddMax { get; set; }

    public required decimal Index { get; set; }
    public required LensDesign LensDesign { get; set; }
}

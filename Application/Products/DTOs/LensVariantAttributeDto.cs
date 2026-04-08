using Domain;

namespace Application.Products.DTOs;
/// <summary>
/// DTO response cho thông số quang học của một Lens ProductVariant
/// </summary>
public sealed class LensVariantAttributeDto
{
    public Guid ProductVariantId { get; set; }
    public decimal SphMin { get; set; }
    public decimal SphMax { get; set; }
    public decimal CylMin { get; set; }
    public decimal CylMax { get; set; }
    public int AxisMin { get; set; }
    public int AxisMax { get; set; }
    public decimal? AddMin { get; set; }
    public decimal? AddMax { get; set; }
    public decimal Index { get; set; }
    public LensDesign LensDesign { get; set; }
}

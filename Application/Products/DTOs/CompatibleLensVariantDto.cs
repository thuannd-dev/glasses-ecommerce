using Domain;

namespace Application.Products.DTOs;

/// <summary>
/// Thông tin một Lens variant tương thích với frame, bao gồm thông số quang học và tồn kho.
/// </summary>
public sealed class CompatibleLensVariantDto
{
    public Guid VariantId { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public bool IsPreOrder { get; set; }

    /// <summary>Null nếu IsPreOrder = true (hàng chưa về kho).</summary>
    public int? StockAvailable { get; set; }

    // ── Optical specs ────────────────────────────────────────────
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

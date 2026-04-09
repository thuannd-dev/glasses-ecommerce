namespace Domain;

/// <summary>
/// Mô tả cấu trúc quang học (thiết kế) của tròng kính.
/// ReadingGlass KHÔNG phải lens design — đó là use-case dùng SingleVision với SPH dương.
/// </summary>
public enum LensDesign
{
    SingleVision = 1,  // Cận / viễn / loạn — 1 tiêu điểm
    Progressive  = 2,  // Đa tròng liên tục (không đường kẻ)
    Bifocal      = 3   // Đa tròng 2 vùng (có đường kẻ)
}

/// <summary>
/// Thông số quang học của một ProductVariant thuộc loại Lens.
/// Quan hệ 1:1 với ProductVariant (shared PK).
/// Chỉ lens variants mới có bản ghi này — frame variants = null.
/// </summary>
public class LensVariantAttribute
{
    /// <summary>
    /// FK + PK — trỏ về ProductVariant.Id (shared primary key pattern).
    /// </summary>
    public Guid ProductVariantId { get; set; }

    // ── SPH range ────────────────────────────────────────────────
    /// <summary>Độ cầu tối thiểu mà lens này hỗ trợ, e.g. -12.00</summary>
    public decimal SphMin { get; set; }

    /// <summary>Độ cầu tối đa mà lens này hỗ trợ, e.g. +6.00</summary>
    public decimal SphMax { get; set; }

    // ── CYL range — [-6, +6] ─────────────────────────────────────
    /// <summary>Độ loạn tối thiểu, e.g. -6.00.</summary>
    public decimal CylMin { get; set; }

    /// <summary>Độ loạn tối đa, e.g. +6.00. 0.00 = không loạn.</summary>
    public decimal CylMax { get; set; }

    // ── AXIS range — luôn đi kèm CYL (0–180 độ) ─────────────────
    /// <summary>Trục loạn tối thiểu (độ). Chỉ có ý nghĩa khi CYL != 0.</summary>
    public int AxisMin { get; set; } = 0;

    /// <summary>Trục loạn tối đa (độ). Chỉ có ý nghĩa khi CYL != 0.</summary>
    public int AxisMax { get; set; } = 180;

    // ── ADD range — chỉ dùng cho Progressive / Bifocal ──────────
    /// <summary>ADD tối thiểu. Null với SingleVision.</summary>
    public decimal? AddMin { get; set; }

    /// <summary>ADD tối đa. Null với SingleVision.</summary>
    public decimal? AddMax { get; set; }

    // ── Specs ────────────────────────────────────────────────────
    /// <summary>Chiết suất tròng kính, e.g. 1.50 / 1.56 / 1.60 / 1.67 / 1.74 / 1.80</summary>
    public decimal Index { get; set; }

    /// <summary>Thiết kế tròng kính: SingleVision, Progressive, Bifocal.</summary>
    public LensDesign LensDesign { get; set; }

    // ── Navigation ───────────────────────────────────────────────
    public ProductVariant Variant { get; set; } = null!;
}

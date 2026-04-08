namespace Application.Carts.DTOs;

/// <summary>
/// Request DTO để thêm item vào cart.
/// LensVariantId và các field prescription/coating là optional — null khi mua gọng trần.
/// </summary>
public sealed class AddCartItemDto
{
    public required Guid ProductVariantId { get; set; }
    public required int Quantity { get; set; }

    // ── Lens selection (optional) ────────────────────────────────
    /// <summary>Null = mua gọng trần không kèm tròng.</summary>
    public Guid? LensVariantId { get; set; }

    // ── Prescription per eye (optional, cần khi có LensVariantId) ─
    // OD = Oculus Dexter (Right) | OS = Oculus Sinister (Left)
    public decimal? SphOD  { get; set; }
    public decimal? CylOD  { get; set; }  // must be ≤ 0
    public int?     AxisOD { get; set; }  // 0–180
    public decimal? AddOD  { get; set; }  // Progressive/Bifocal only
    public decimal? PdOD   { get; set; }  // pupillary distance (mm)

    public decimal? SphOS  { get; set; }
    public decimal? CylOS  { get; set; }  // must be ≤ 0
    public int?     AxisOS { get; set; }
    public decimal? AddOS  { get; set; }
    public decimal? PdOS   { get; set; }

    /// <summary>PD tổng nếu không tách per eye.</summary>
    public decimal? Pd { get; set; }

    // ── Coating selection (optional) ─────────────────────────────
    /// <summary>Danh sách LensCoatingOption IDs được chọn thêm.</summary>
    public List<Guid>? SelectedCoatingIds { get; set; }
}

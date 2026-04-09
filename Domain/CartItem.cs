namespace Domain;

public class CartItem
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required Guid CartId { get; set; }

    /// <summary>Frame variant được chọn.</summary>
    public required Guid ProductVariantId { get; set; }

    public required int Quantity { get; set; }

    // ── Lens selection (null = gọng trần, không kèm tròng) ──────
    /// <summary>Lens variant được chọn kèm với frame. Null nếu mua gọng trần.</summary>
    public Guid? LensVariantId { get; set; }

    // ── Inline prescription (full snapshot — không FK) ───────────
    // Lưu đủ để tạo Prescription + PrescriptionDetail lúc checkout.
    // OD = Oculus Dexter (mắt phải) | OS = Oculus Sinister (mắt trái)
    public decimal? PrescriptionSphOD  { get; set; }
    public decimal? PrescriptionCylOD  { get; set; }  // [-6, +6]
    public int?     PrescriptionAxisOD { get; set; }  // 0–180, ý nghĩa khi CYL != 0
    public decimal? PrescriptionAddOD  { get; set; }  // chỉ cho Progressive/Bifocal
    public decimal? PrescriptionPdOD   { get; set; }  // pupillary distance mắt phải (mm)

    public decimal? PrescriptionSphOS  { get; set; }
    public decimal? PrescriptionCylOS  { get; set; }  // [-6, +6]
    public int?     PrescriptionAxisOS { get; set; }
    public decimal? PrescriptionAddOS  { get; set; }
    public decimal? PrescriptionPdOS   { get; set; }  // pupillary distance mắt trái (mm)

    /// <summary>PD tổng nếu prescription không chia per eye.</summary>
    public decimal? PrescriptionPd { get; set; }

    // ── Coating selection ────────────────────────────────────────
    /// <summary>
    /// JSON array of LensCoatingOption IDs được chọn.
    /// e.g.: ["uuid-uv", "uuid-bluelight"]
    /// Null nếu không chọn coating nào.
    /// </summary>
    public string? SelectedCoatingIdsJson { get; set; }

    /// <summary>Tổng giá coating đã snapshot tại thời điểm add to cart.</summary>
    public decimal CoatingExtraPrice { get; set; } = 0;

    // ── Navigation ───────────────────────────────────────────────
    public Cart Cart { get; set; } = null!;
    public ProductVariant ProductVariant { get; set; } = null!;

    /// <summary>Lens variant navigation. Null nếu gọng trần.</summary>
    public ProductVariant? LensVariant { get; set; }
}

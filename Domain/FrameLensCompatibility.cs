namespace Domain;

/// <summary>
/// Bảng join M:N giữa Frame Product và Lens Product.
/// Manager xác định tròng kính nào tương thích với gọng kính nào.
/// Composite PK: (FrameProductId, LensProductId).
/// </summary>
public class FrameLensCompatibility
{
    /// <summary>FK → Product (Type = Frame). Phần của composite PK.</summary>
    public Guid FrameProductId { get; set; }

    /// <summary>FK → Product (Type = Lens). Phần của composite PK.</summary>
    public Guid LensProductId { get; set; }

    // ── Navigation ───────────────────────────────────────────────
    public Product FrameProduct { get; set; } = null!;
    public Product LensProduct  { get; set; } = null!;
}

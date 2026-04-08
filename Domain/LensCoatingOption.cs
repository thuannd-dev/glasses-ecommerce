namespace Domain;

/// <summary>
/// Tùy chọn coating (lớp phủ) của một sản phẩm tròng kính.
/// Mỗi coating tính thêm tiền vào giá tròng kính cơ bản.
/// Quan hệ N:1 với Product (Type = Lens).
/// </summary>
public class LensCoatingOption
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    /// <summary>FK → Product (Type = Lens) sở hữu coating này.</summary>
    public required Guid LensProductId { get; set; }

    /// <summary>Tên coating hiển thị cho khách, e.g. "UV Protection", "Blue Light Block"</summary>
    public required string CoatingName { get; set; }

    /// <summary>Mô tả thêm về coating.</summary>
    public string? Description { get; set; }

    /// <summary>Giá cộng thêm vào tròng kính base price khi khách chọn coating này.</summary>
    public required decimal ExtraPrice { get; set; }

    /// <summary>false = ẩn khỏi danh sách, không thể chọn mới nhưng không xóa data.</summary>
    public bool IsActive { get; set; } = true;

    // ── Navigation ───────────────────────────────────────────────
    public Product LensProduct { get; set; } = null!;
}

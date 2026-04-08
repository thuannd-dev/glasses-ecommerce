namespace Application.Carts.DTOs;

public sealed class CartItemDto
{
    public Guid Id { get; set; }
    public Guid CartId { get; set; }
    public Guid ProductVariantId { get; set; }
    public int Quantity { get; set; }

    // ── Frame (ProductVariant) info ──────────────────────────────
    public string Sku { get; set; } = null!;
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public string? Color { get; set; }
    public string? Size { get; set; }
    public string? Material { get; set; }

    // ── Stock ────────────────────────────────────────────────────
    public int QuantityAvailable { get; set; }
    public bool IsInStock { get; set; }
    public bool IsPreOrder { get; set; }

    // ── Product info ─────────────────────────────────────────────
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? ProductImageUrl { get; set; }

    // ── Lens selection snapshot ──────────────────────────────────
    /// <summary>Null = gọng trần.</summary>
    public Guid? LensVariantId { get; set; }
    public string? LensVariantName { get; set; }
    public decimal LensPrice { get; set; }

    // ── Coating snapshot ─────────────────────────────────────────
    public decimal CoatingExtraPrice { get; set; }

    // ── Prescription flag ────────────────────────────────────────
    /// <summary>True nếu khách đã nhập toa.</summary>
    public bool HasPrescription { get; set; }

    // ── Calculated ───────────────────────────────────────────────
    /// <summary>Quantity × (FramePrice + LensPrice + CoatingExtraPrice)</summary>
    public decimal Subtotal { get; set; }
}

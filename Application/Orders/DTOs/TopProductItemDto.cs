namespace Application.Orders.DTOs;

/// <summary>
/// Đại diện cho một dòng trong báo cáo Top Sản phẩm bán chạy.
/// Lưu ý: Rank sẽ được assign ở Application layer.
/// </summary>
public sealed class TopProductItemDto
{
    public int Rank { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? Brand { get; set; }
    public string ProductType { get; set; } = null!;
    public Guid VariantId { get; set; }
    public string? VariantName { get; set; }
    public string Sku { get; set; } = null!;
    public int TotalQuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
    public int OrderCount { get; set; }
}

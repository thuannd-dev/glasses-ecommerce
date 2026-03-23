namespace Application.Orders.DTOs;

/// <summary>
/// Data transfer object for the GHN order creation API request.
/// </summary>
public sealed class GHNCreateOrderRequestDto
{
    public string ToName { get; set; } = string.Empty;
    public string ToPhone { get; set; } = string.Empty;
    public string ToAddress { get; set; } = string.Empty;
    public string ToWardCode { get; set; } = string.Empty;
    public int ToDistrictId { get; set; }
    public int Weight { get; set; } = 200; // default 200g
    public int Length { get; set; } = 20;  // default 20cm
    public int Width { get; set; } = 15;   // default 15cm
    public int Height { get; set; } = 10;  // default 10cm
    public int ServiceTypeId { get; set; } = 2; // 2: Chuyển phát truyền thống (E-commerce)
    public int PaymentTypeId { get; set; } = 1; // 1: Người bán trả cước
    public string RequiredNote { get; set; } = "CHOXEMHANGKHONGTHU"; // Cho xem hàng không cho thử
    public List<GHNItemDto> Items { get; set; } = new();
    public string ClientOrderCode { get; set; } = string.Empty;
    public decimal CodAmount { get; set; }
    public decimal? InsuranceValue { get; set; }
}

/// <summary>
/// Data transfer object representing an item within a GHN order.
/// </summary>
public sealed class GHNItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public int Weight { get; set; } = 50;
}

/// <summary>
/// Data transfer object for the response from GHN after creating an order.
/// </summary>
public sealed class GHNCreateOrderResponseDto
{
    public string OrderCode { get; set; } = string.Empty;
    public int TotalFee { get; set; }
    public string ExpectedDeliveryTime { get; set; } = string.Empty;
}

/// <summary>
/// Data transfer object for the response containing the GHN print token.
/// </summary>
public sealed class GHNPrintOrderResponseDto
{
    public string Token { get; set; } = string.Empty;
}

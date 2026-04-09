namespace Application.Orders.DTOs;

//Dto Response cho thông tin item trong đơn hàng (dùng chung cho staff và customer)
public sealed class OrderItemOutputDto
{
    public Guid Id { get; set; }
    public Guid ProductVariantId { get; set; }
    public string? Sku { get; set; }
    public string? VariantName { get; set; }
    public string? ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal DiscountApplied { get; set; }  // Discount amount for this item
    public string? ProductImageUrl { get; set; }
    public Guid? PrescriptionId { get; set; }

    // Lens fields
    public string? LensVariantName { get; set; }
    public decimal LensUnitPrice { get; set; }

    // Coating fields
    public decimal CoatingExtraPrice { get; set; }
    
    [System.Text.Json.Serialization.JsonIgnore]
    public string? CoatingsSnapshot { get; set; }

    private static readonly System.Text.Json.JsonSerializerOptions _coatingJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public List<Application.Orders.DTOs.OrderItemCoatingDto> SelectedCoatings 
    { 
        get
        {
            if (string.IsNullOrWhiteSpace(CoatingsSnapshot)) return [];
            try 
            { 
                return System.Text.Json.JsonSerializer.Deserialize<List<Application.Orders.DTOs.OrderItemCoatingDto>>(CoatingsSnapshot, _coatingJsonOptions) ?? []; 
            }
            catch (System.Text.Json.JsonException)
            { 
                return []; 
            }
        }
    }
}

namespace Application.Orders.DTOs;

public sealed record PackingSlipDto
{
    public required Guid OrderId { get; init; }
    
    public required string OrderNumber { get; init; }
    
    public required DateTime OrderDate { get; init; }
    
    public required decimal TotalAmount { get; init; }
    
    public required CustomerInfoDto CustomerInfo { get; init; }
    
    public required ShippingAddressDto ShippingAddress { get; init; }
    
    public required PackingSlipItemDto[] Items { get; init; }
    
    public string? CustomerNote { get; init; }
    
    public required DateTime PrintedAt { get; init; }
}

public sealed record CustomerInfoDto
{
    public required string Name { get; init; }
    
    public required string Email { get; init; }
    
    public required string PhoneNumber { get; init; }
}

public sealed record ShippingAddressDto
{
    public required string RecipientName { get; init; }
    
    public required string RecipientPhone { get; init; }
    
    public required string Venue { get; init; }
    
    public required string Ward { get; init; }
    
    public required string District { get; init; }
    
    public required string City { get; init; }
    
    public required string PostalCode { get; init; }
}

public sealed record PackingSlipItemDto
{
    public required string ProductName { get; init; }
    
    public required string VariantName { get; init; }
    
    public required int PickedQuantity { get; init; }
    
    public string? Notes { get; init; }
    
    public bool IsChecked { get; set; }
}

namespace Application.Orders.DTOs;

public sealed record ShipmentHandoverDto
{
    public required Guid OrderId { get; init; }
    
    public required string OrderNumber { get; init; }
    
    public required string CarrierName { get; init; }
    
    public string? TrackingCode { get; init; }
    
    public string? TrackingUrl { get; init; }
    
    public decimal? PackageWeight { get; init; }
    
    public string? PackageDimensions { get; init; }
    
    public string? ShippingNotes { get; init; }
    
    public DateTime? EstimatedDeliveryAt { get; init; }
}

public sealed record ShipmentCreateDto
{
    public required Guid OrderId { get; init; }
    
    public required string CarrierName { get; init; }
    
    public string? TrackingCode { get; init; }
    
    public string? TrackingUrl { get; init; }
    
    public decimal? PackageWeight { get; init; }
    
    public string? PackageDimensions { get; init; }
    
    public string? ShippingNotes { get; init; }
    
    public DateTime? EstimatedDeliveryAt { get; init; }
}

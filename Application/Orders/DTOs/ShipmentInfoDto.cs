namespace Application.Orders.DTOs;

//Dto Response thông tin vận chuyển
public sealed class ShipmentInfoDto
{
    public string CarrierName { get; set; } = null!;
    public string? TrackingCode { get; set; }
    public string? TrackingUrl { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? EstimatedDeliveryAt { get; set; }
    public DateTime? ActualDeliveryAt { get; set; }
    public string? ShippingNotes { get; set; }
}

using Domain;

namespace Application.Orders.DTOs;

//Dto Input thông tin vận chuyển khi staff chuyển trạng thái sang Shipped
public sealed class ShipmentInputDto
{
    public required ShippingCarrier CarrierName { get; set; }
    public string? TrackingCode { get; set; }
    public string? TrackingUrl { get; set; }
    public DateTime? EstimatedDeliveryAt { get; set; }
    public string? ShippingNotes { get; set; }
}

using System;

namespace Domain;

public enum ShippingCarrier
{
    Unknown = 0,
    GHN = 1,      // Giao Hàng Nhanh
    GHTK = 2      // Giao Hàng Tiết Kiệm
}

public class ShipmentInfo
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required Guid OrderId { get; set; }

    public ShippingCarrier CarrierName { get; set; } // GHN, GHTK

    public string? TrackingCode { get; set; }

    public string? TrackingUrl { get; set; }

    public DateTime? ShippedAt { get; set; }

    public DateTime? EstimatedDeliveryAt { get; set; }

    public DateTime? ActualDeliveryAt { get; set; }

    public decimal? PackageWeight { get; set; }

    public string? PackageDimensions { get; set; }
    public string? ShippingNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Order Order { get; set; } = null!;
    public User? Creator { get; set; }
}

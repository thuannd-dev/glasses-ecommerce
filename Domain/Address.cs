using System;

namespace Domain;

public class Address
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required Guid UserId { get; set; }
    public required string RecipientName { get; set; } //Recipient: Người nhận hàng
    public required string RecipientPhone { get; set; }
    public required string Venue { get; set; }
    public required string Ward { get; set; }
    public required string District { get; set; }
    public required string City { get; set; }
    public string? PostalCode { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsDefault { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = [];
}

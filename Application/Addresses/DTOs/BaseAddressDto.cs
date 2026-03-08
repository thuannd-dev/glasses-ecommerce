namespace Application.Addresses.DTOs;

public class BaseAddressDto
{
    public required string RecipientName { get; set; }
    public required string RecipientPhone { get; set; }
    public required string Venue { get; set; }
    public required string Ward { get; set; }
    public required string District { get; set; }
    public required string City { get; set; }
    public string? PostalCode { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsDefault { get; set; }
}

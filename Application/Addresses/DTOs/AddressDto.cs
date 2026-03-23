namespace Application.Addresses.DTOs;

public sealed class AddressDto
{
    public Guid Id { get; set; }
    public required string RecipientName { get; set; }
    public required string RecipientPhone { get; set; }
    public required string Venue { get; set; }
    public required string Ward { get; set; }
    public required string District { get; set; }
    public required string Province { get; set; }
    public int? ProvinceId { get; set; }
    public int? DistrictId { get; set; }
    public string? WardCode { get; set; }
    public string? PostalCode { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsDefault { get; set; }
}

namespace Application.Orders.DTOs;

/// <summary>
/// Data transfer object for creating a GHN shipping order request from the client.
/// </summary>
public sealed class CreateGHNOrderDto
{
    public int DistrictId { get; set; }
    public string WardCode { get; set; } = string.Empty;
    public int Weight { get; set; } = 200;
    public int Length { get; set; } = 20;
    public int Width { get; set; } = 15;
    public int Height { get; set; } = 10;
    public string RequiredNote { get; set; } = "CHOXEMHANGKHONGTHU";
}

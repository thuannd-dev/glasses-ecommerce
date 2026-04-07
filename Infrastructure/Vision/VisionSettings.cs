namespace Infrastructure.Vision;

public sealed class VisionSettings
{
    public required string Key { get; set; }
    public required string Endpoint { get; set; }
    public decimal RowTolerance { get; set; } = 12m;
}

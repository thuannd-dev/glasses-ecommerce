namespace Application.AfterSales.DTOs;
/// <summary>
/// Dto Request để Staff yêu cầu customer cung cấp thêm bằng chứng
/// </summary>
public sealed class RequestEvidenceDto
{
    public required string Message { get; set; }
}

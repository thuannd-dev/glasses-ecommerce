using System.Text.Json.Serialization;

namespace Application.Orders.DTOs;

/// <summary>
/// Data transfer object for handling webhook updates pushed by GHN.
/// </summary>
public sealed class GHNWebhookPayloadDto
{
    [JsonPropertyName("OrderCode")]
    public string OrderCode { get; set; } = string.Empty;
    
    [JsonPropertyName("ClientOrderCode")]
    public string ClientOrderCode { get; set; } = string.Empty; 
    
    [JsonPropertyName("Status")]
    public string Status { get; set; } = string.Empty;
    
    [JsonPropertyName("ReasonCode")]
    public string ReasonCode { get; set; } = string.Empty;
    
    [JsonPropertyName("Reason")]
    public string Reason { get; set; } = string.Empty;
}

namespace Infrastructure.Vision;

/// <summary>
/// Configuration settings for the OpenAI API used in LLM-based prescription parsing.
/// </summary>
public sealed class OpenAiSettings
{
    public required string ApiKey { get; set; }

    public string Model { get; set; } = "gpt-4o-mini";
}

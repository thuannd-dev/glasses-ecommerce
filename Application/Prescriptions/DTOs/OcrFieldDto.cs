namespace Application.Prescriptions.DTOs;

/// <summary>
/// Represents a single extracted field from OCR with its confidence score
/// </summary>
public sealed class OcrFieldDto
{
    /// <summary>
    /// The extracted value (e.g., "-2.50" for SPH)
    /// </summary>
    public string? Value { get; set; }

    /// <summary>
    /// Confidence score from 0.0 to 1.0
    /// </summary>
    public decimal Confidence { get; set; }

    /// <summary>
    /// Whether this field was successfully extracted
    /// </summary>
    public bool IsExtracted { get; set; }
}

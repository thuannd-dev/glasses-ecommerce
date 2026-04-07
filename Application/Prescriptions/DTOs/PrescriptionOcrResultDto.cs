namespace Application.Prescriptions.DTOs;

/// <summary>
/// Confidence level categorization for OCR results
/// </summary>
public enum OcrConfidenceLevel
{
    /// <summary>
    /// High confidence (>= 0.85) - all critical fields extracted with high confidence
    /// </summary>
    High,

    /// <summary>
    /// Medium confidence (0.60-0.84) - some fields extracted, some missing or low confidence
    /// </summary>
    Medium,

    /// <summary>
    /// Low confidence (< 0.60) - failed to extract or very low confidence
    /// </summary>
    Low
}

/// <summary>
/// Complete OCR result for prescription image analysis
/// </summary>
public sealed class PrescriptionOcrResultDto
{
    /// <summary>
    /// Cloudinary URL of the uploaded prescription image
    /// </summary>
    public required string ImageUrl { get; set; }

    /// <summary>
    /// Cloudinary public ID for the image
    /// </summary>
    public required string PublicId { get; set; }

    /// <summary>
    /// Raw text extracted from OCR (full text)
    /// </summary>
    public required string RawText { get; set; }

    /// <summary>
    /// Parsed values for the right eye (OD)
    /// </summary>
    public ExtractedPrescriptionValueDto? RightEye { get; set; }

    /// <summary>
    /// Parsed values for the left eye (OS)
    /// </summary>
    public ExtractedPrescriptionValueDto? LeftEye { get; set; }

    /// <summary>
    /// Pupillary Distance (PD) — shared across both eyes.
    /// Binocular PD (e.g. "61") is stored here.
    /// Monocular split PD (e.g. "31/30") is split: RightEye.PD = 31, LeftEye.PD = 30.
    /// </summary>
    public OcrFieldDto? PD { get; set; }

    /// <summary>
    /// Overall confidence level
    /// </summary>
    public OcrConfidenceLevel ConfidenceLevel { get; set; }

    /// <summary>
    /// Overall confidence score (0.0 to 1.0)
    /// </summary>
    public decimal OverallConfidence { get; set; }

    /// <summary>
    /// Whether parsing was successful
    /// </summary>
    public bool ParsedSuccessfully { get; set; }

    /// <summary>
    /// Any warnings or notes about the parsing
    /// </summary>
    public List<string> Warnings { get; set; } = [];
}

namespace Application.Prescriptions.DTOs;

/// <summary>
/// Represents extracted prescription values for one eye (Left or Right)
/// </summary>
public sealed class ExtractedPrescriptionValueDto
{
    /// <summary>
    /// Sphere (SPH) - nearsighted (-) or farsighted (+)
    /// </summary>
    public OcrFieldDto? SPH { get; set; }

    /// <summary>
    /// Cylinder (CYL) - astigmatism correction
    /// </summary>
    public OcrFieldDto? CYL { get; set; }

    /// <summary>
    /// Axis - angle of astigmatism (0-180 degrees)
    /// </summary>
    public OcrFieldDto? AXIS { get; set; }

    /// <summary>
    /// Pupillary Distance (PD) - distance between pupils in mm
    /// </summary>
    public OcrFieldDto? PD { get; set; }

    /// <summary>
    /// Addition (ADD) - for multifocal/progressive lenses
    /// </summary>
    public OcrFieldDto? ADD { get; set; }

    /// <summary>
    /// Overall confidence for this eye's data (0.0 to 1.0)
    /// </summary>
    public decimal OverallConfidence { get; set; }
}

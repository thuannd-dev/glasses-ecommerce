using Application.Prescriptions.DTOs;

namespace Application.Interfaces;

/// <summary>
/// Service for Azure AI Vision Read API operations
/// </summary>
public interface IAzureVisionService
{
    /// <summary>
    /// Reads text from an image URL using Azure AI Vision Read API and parses prescription values
    /// </summary>
    /// <param name="imageUrl">Image URL (e.g., from Cloudinary)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Parsed prescription OCR result with extracted values and confidence scores</returns>
    Task<PrescriptionOcrResultDto> ReadPrescriptionFromImageUrlAsync(
        string imageUrl, 
        CancellationToken cancellationToken = default);
}

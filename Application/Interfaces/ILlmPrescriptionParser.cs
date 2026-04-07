using Application.Prescriptions.DTOs;

namespace Application.Interfaces;

/// <summary>
/// Service for parsing prescription data from raw OCR text using a Large Language Model.
/// </summary>
public interface ILlmPrescriptionParser
{
    /// <summary>
    /// Sends raw OCR text to an LLM and returns a structured prescription result.
    /// </summary>
    /// <param name="rawOcrText">The raw text extracted by the OCR engine (e.g., Azure Vision).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A <see cref="PrescriptionOcrResultDto"/> with parsed prescription values.</returns>
    Task<PrescriptionOcrResultDto> ParseAsync(
        string rawOcrText,
        CancellationToken cancellationToken = default);
}

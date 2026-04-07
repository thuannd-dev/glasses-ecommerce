using System.Text.Json.Serialization;
using Application.Core;
using Application.Interfaces;
using Application.Prescriptions.DTOs;
using MediatR;

namespace Application.Prescriptions.Commands;

/// <summary>
/// Command to analyze prescription image from Cloudinary URL using Azure AI Vision Read API
/// </summary>
public sealed class AnalyzePrescriptionFromUrl
{
    public sealed class Command : IRequest<Result<PrescriptionOcrResultDto>>
    {
        [JsonPropertyName("imageUrl")]
        public required string ImageUrl { get; set; }

        [JsonPropertyName("publicId")]
        public required string PublicId { get; set; }
    }

    internal sealed class Handler(
        IAzureVisionService visionService) : IRequestHandler<Command, Result<PrescriptionOcrResultDto>>
    {
        public async Task<Result<PrescriptionOcrResultDto>> Handle(Command request, CancellationToken ct)
        {
            // Call Azure Vision Read API to extract text and parse prescription values
            try
            {
                PrescriptionOcrResultDto ocrResult = await visionService.ReadPrescriptionFromImageUrlAsync(
                    request.ImageUrl, 
                    ct);

                // Set Cloudinary URLs in the result
                ocrResult.ImageUrl = request.ImageUrl;
                ocrResult.PublicId = request.PublicId;

                return Result<PrescriptionOcrResultDto>.Success(ocrResult);
            }
            catch (Exception ex)
            {
                return Result<PrescriptionOcrResultDto>.Failure(
                    $"OCR analysis failed: {ex.Message}", 
                    500);
            }
        }
    }
}

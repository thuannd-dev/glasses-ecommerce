using Application.Core;
using Application.Interfaces;
using Application.Profiles.DTOs;
using Application.Uploads.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Uploads.Commands;

public sealed class UploadGlb
{
    public sealed class Command : IRequest<Result<GlbUploadDto>>
    {
        public required IFormFile File { get; set; }
    }

    internal sealed class Handler(
        IPhotoService photoService) : IRequestHandler<Command, Result<GlbUploadDto>>
    {
        public async Task<Result<GlbUploadDto>> Handle(Command request, CancellationToken ct)
        {
            PhotoUploadResult? uploadResult = await photoService.UploadGlb(request.File);

            if (uploadResult == null)
                return Result<GlbUploadDto>.Failure("Failed to upload GLB file to the cloud service.", 500);

            GlbUploadDto dto = new()
            {
                Url = uploadResult.Url,
                PublicId = uploadResult.PublicId
            };

            return Result<GlbUploadDto>.Success(dto);
        }
    }
}

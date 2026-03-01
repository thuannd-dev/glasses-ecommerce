using Application.Core;
using Application.Interfaces;
using Application.Profiles.DTOs;
using Application.Uploads.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Uploads.Commands;

public sealed class UploadImage
{
    public sealed class Command : IRequest<Result<ImageUploadDto>>
    {
        public required IFormFile File { get; set; }
    }

    internal sealed class Handler(
        IPhotoService photoService) : IRequestHandler<Command, Result<ImageUploadDto>>
    {
        public async Task<Result<ImageUploadDto>> Handle(Command request, CancellationToken ct)
        {
            PhotoUploadResult? uploadResult = await photoService.UploadPhoto(request.File);

            if (uploadResult == null)
                return Result<ImageUploadDto>.Failure("Failed to upload image to the cloud service.", 500);

            ImageUploadDto dto = new()
            {
                Url = uploadResult.Url,
                PublicId = uploadResult.PublicId
            };

            return Result<ImageUploadDto>.Success(dto);
        }
    }
}

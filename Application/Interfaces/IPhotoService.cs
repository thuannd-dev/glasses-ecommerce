using System;
using Application.Profiles.DTOs;
using Microsoft.AspNetCore.Http;

namespace Application.Interfaces;

public interface IPhotoService
{
    Task<PhotoUploadResult?> UploadPhoto(IFormFile file);
    Task<PhotoUploadResult?> UploadRaw(IFormFile file);
    Task<PhotoUploadResult?> UploadGlb(IFormFile file);
    Task<string> DeletePhoto(string publicId);
    Task<PhotoUploadResult?> UploadPhotoFromUrl(string imageUrl);

}

namespace Application.Products.DTOs;

public sealed class UpdateImageModelUrlDto
{
    /// <summary>
    /// URL của file 3D model (.glb) đã được upload lên Cloudinary.
    /// Truyền null nếu muốn xóa 3D model khỏi ảnh này.
    /// </summary>
    public string? ModelUrl { get; set; }
}

using Domain;

namespace Application.Products.DTOs;

/// <summary>
/// DTO request để cập nhật Product — tất cả field đều optional (partial update)
/// Type không có trong DTO vì không cho phép thay đổi sau khi tạo
/// </summary>
public sealed class UpdateProductDto
{
    public Guid? CategoryId { get; set; }
    public string? ProductName { get; set; }
    public string? Description { get; set; }
    public string? Brand { get; set; }
    public ProductStatus? Status { get; set; }
}

namespace Application.Products.DTOs;

/// <summary>
/// DTO response cho một coating option của Lens Product
/// </summary>
public sealed class LensCoatingOptionDto
{
    public Guid Id { get; set; }
    public Guid LensProductId { get; set; }
    public string CoatingName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal ExtraPrice { get; set; }
    public bool IsActive { get; set; }
}

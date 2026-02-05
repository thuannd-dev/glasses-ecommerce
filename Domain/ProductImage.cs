using System;

namespace Domain;

public class ProductImage
{
    public string Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow()).ToString();

    public string? ProductVariantId { get; set; }

    public string? ProductId { get; set; }

    public required string ImageUrl { get; set; }

    public string? AltText { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? ModelUrl { get; set; } // for 3D model link

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
    public string? CreatedBy { get; set; }

    // Navigation properties
    public ProductVariant? ProductVariant { get; set; }

    public Product? Product { get; set; }

    //Unidirectional
    public User? Creator { get; set; }
    //Unidirectional
    public User? Deleter { get; set; }
}

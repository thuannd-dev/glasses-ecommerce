using System;

namespace Domain;

public class ProductImage
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    public Guid? ProductVariantId { get; set; }

    public Guid? ProductId { get; set; }
    public required string ImageUrl { get; set; }

    public string? AltText { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? ModelUrl { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
    public Guid? CreatedBy { get; set; }

    // Navigation properties
    public ProductVariant? ProductVariant { get; set; }

    public Product? Product { get; set; }

    //Unidirectional
    public User? Creator { get; set; }
    //Unidirectional
    public User? Deleter { get; set; }
}

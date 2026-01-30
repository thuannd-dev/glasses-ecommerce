using System;

namespace Domain;

public enum ProductType
{
    Unknown = 0,
    Frame = 1,
    Lens = 2,
    Combo = 3,
    Accessory = 4,
    Service = 5
}

public enum ProductStatus
{
    Active = 0,
    Inactive = 1,
    Draft = 2
}

public class Product
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    public required Guid CategoryId { get; set; }

    public required string ProductName { get; set; }

    public required ProductType Type { get; set; } // Frame, Lens, Combo, Accessory, Service

    public string? Description { get; set; }

    public string? Brand { get; set; }

    public ProductStatus Status { get; set; } = ProductStatus.Active; // ACTIVE, INACTIVE, DRAFT

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ProductCategory Category { get; set; } = null!;
    
    public ICollection<ProductVariant> Variants { get; set; } = [];
    public ICollection<ProductImage> Images { get; set; } = [];
}

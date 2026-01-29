using System;

namespace Domain;

public class ProductCategory
{
    public string Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow()).ToString();

    public required string Name { get; set; }

    public required string Slug { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation property
    public ICollection<Product> Products { get; set; } = [];
}

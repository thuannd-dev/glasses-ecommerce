using System;

namespace Domain;

public class ProductCategory
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    public required string Name { get; set; }

    public required string Slug { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation property
    public ICollection<Product> Products { get; set; } = [];
}

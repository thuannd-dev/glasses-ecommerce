using System;

namespace Domain;

public enum CartStatus
{
    Unknown = 0,
    Active = 1,
    Abandoned = 2,//Abandoned là trạng thái suy ra theo thời gian
    Converted = 3
}

public class Cart
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public Guid? UserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public CartStatus Status { get; set; } = CartStatus.Active;

    // Navigation properties
    public User? User { get; set; }

    public ICollection<CartItem> Items { get; set; } = [];

}

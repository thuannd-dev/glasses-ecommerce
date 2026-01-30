using System;
using Microsoft.AspNetCore.Identity;

namespace Domain;

public class User : IdentityUser<Guid>
{
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsLocked { get; set; } = false;

    //navigation properties
    public ICollection<ActivityAttendee> Activities { get; set; } = [];
    public ICollection<Photo> Photos { get; set; } = [];
    public ICollection<Address> Addresses { get; set; } = [];
    public ICollection<Cart> Carts { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];

    //thêm public ICollection<Order> CreatedOrders { get; set; } = new List<Order>(); vào class User
    //nếu muốn truy cập user.CreatedOrders thì đổi thành .WithMany(u => u.CreatedOrders)
    // trong AppDbContext.cs ở phần entity.HasOne(e => e.SalesStaff) sửa thành .WithMany(u => u.CreatedOrders)
}

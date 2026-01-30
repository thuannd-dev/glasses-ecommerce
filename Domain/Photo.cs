using System;
using System.Text.Json.Serialization;

namespace Domain;

public class Photo
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required string Url { get; set; }
    public required string PublicId { get; set; }

    //navigation properties
    //if we don't define navigation properties EF Core will also create a property for UserId but it will be nullable
    public required Guid UserId { get; set; }
    
    [JsonIgnore]
    public User User { get; set; } = null!;
}

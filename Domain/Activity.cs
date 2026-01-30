using System;

namespace Domain;

public class Activity
{
    //Just public accessor beacuse if we use private
    //entity framework not a part of this class so it will not be able to access it
    //And throw an error
    //[Key] is unnecessary because Entity Framework Core will automatically
    //treat the Id property as the primary key if it is named "Id" or "<ClassName>Id".
    //So, you can  use [Key] attribute when want an attribute with the specific name is Id.
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());
    public required string Title { get; set; }
    //DateTime is a reference type but don't get warning 
    //beacause c# give a default value of DateTime is 1/ January 0001 00:00:00
    public DateTime Date { get; set; }
    //string is a reference type so it can warning if it is null
    //we can use nullable reference type to avoid this warning
    public required string Description { get; set; }
    public required string Category { get; set; }

    public bool IsCancelled { get; set; }
    //location props
    public required string City { get; set; }
    //địa điểm 
    public required string Venue { get; set; }
    //vĩ độ
    //double | number is a value type and default value is 0
    public double Latitude { get; set; }
    //kinh độ
    public double Longitude { get; set; }

    //navigation property
    public ICollection<ActivityAttendee> Attendees { get; set; } = [];
}

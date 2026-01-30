using System;
using Application.Profiles.DTOs;

namespace Application.Activities.DTOs;

public class ActivityDto
{
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public DateTime Date { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }

    public bool IsCancelled { get; set; }
    public required string HostDisplayName { get; set; }
    public required string HostId { get; set; }
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
    public ICollection<UserProfile> Attendees { get; set; } = [];
}

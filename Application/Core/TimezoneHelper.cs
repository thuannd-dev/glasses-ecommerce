namespace Application.Core;

/// <summary>
/// Helper utility for working with Vietnam timezone (UTC+7)
/// </summary>
public static class TimezoneHelper
{
    private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

    /// <summary>
    /// Gets the current time in Vietnam timezone
    /// </summary>
    public static DateTime GetVietnamNow()
    {
        DateTime utcNow = DateTime.UtcNow;
        return TimeZoneInfo.ConvertTimeFromUtc(utcNow, VietnamTimeZone);
    }

    /// <summary>
    /// Converts UTC time to Vietnam timezone
    /// </summary>
    public static DateTime ConvertToVietnam(DateTime utcTime)
    {
        if (utcTime.Kind != DateTimeKind.Utc)
            throw new ArgumentException("Input datetime must be in UTC kind", nameof(utcTime));
        
        return TimeZoneInfo.ConvertTimeFromUtc(utcTime, VietnamTimeZone);
    }

    /// <summary>
    /// Converts Vietnam time to UTC
    /// </summary>
    public static DateTime ConvertToUtc(DateTime vietnamTime)
    {
        if (vietnamTime.Kind != DateTimeKind.Unspecified)
            throw new ArgumentException("Input datetime should have Unspecified kind for local Vietnam time", nameof(vietnamTime));
        
        return TimeZoneInfo.ConvertTimeToUtc(vietnamTime, VietnamTimeZone);
    }
}

namespace Application.Interfaces;

/// <summary>
/// Configuration settings for email service.
/// </summary>
public sealed class EmailSettings
{
    public required string SmtpServer { get; set; }
    public required int SmtpPort { get; set; }
    public required string SmtpUsername { get; set; }
    public required string SmtpPassword { get; set; }
    public required string FromEmail { get; set; }
    public required string FromName { get; set; }
    public bool EnableSsl { get; set; } = true;
    public required string FrontendUrl { get; set; }
}

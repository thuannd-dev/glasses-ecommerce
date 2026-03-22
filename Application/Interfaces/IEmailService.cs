namespace Application.Interfaces;

/// <summary>
/// Service for sending emails to customers.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an email asynchronously.
    /// </summary>
    /// <param name="toEmail">Recipient email address</param>
    /// <param name="subject">Email subject</param>
    /// <param name="htmlContent">Email body in HTML format</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Whether the email was sent successfully</returns>
    Task<bool> SendEmailAsync(
        string toEmail,
        string subject,
        string htmlContent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends an order confirmation email to the customer.
    /// </summary>
    /// <param name="toEmail">Customer email address</param>
    /// <param name="orderNumber">Order ID</param>
    /// <param name="customerName">Customer name</param>
    /// <param name="items">List of items ordered</param>
    /// <param name="breakdown">Price breakdown including subtotal, discount, shipping, and final amount</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Whether the email was sent successfully</returns>
    Task<bool> SendOrderConfirmationEmailAsync(
        string toEmail,
        string orderNumber,
        string customerName,
        List<(string ProductName, int Quantity, decimal Price)> items,
        Application.Orders.DTOs.OrderEmailBreakdownDto breakdown,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a password recovery email to the user.
    /// </summary>
    /// <param name="toEmail">User email address</param>
    /// <param name="userName">User name</param>
    /// <param name="resetLink">Password reset link with token</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Whether the email was sent successfully</returns>
    Task<bool> SendPasswordRecoveryEmailAsync(
        string toEmail,
        string userName,
        string resetLink,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a welcome email to a newly registered user.
    /// </summary>
    /// <param name="toEmail">User email address</param>
    /// <param name="userName">User name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Whether the email was sent successfully</returns>
    Task<bool> SendWelcomeEmailAsync(
        string toEmail,
        string userName,
        CancellationToken cancellationToken = default);
}

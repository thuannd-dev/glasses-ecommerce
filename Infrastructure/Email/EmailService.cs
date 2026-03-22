using System.Net;
using System.Net.Mail;
using System.Web;
using Application.Interfaces;
using Application.Orders.DTOs;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Email;

public sealed class EmailService(
    IOptions<EmailSettings> emailSettings,
    ILogger<EmailService> logger) : IEmailService
{
    private readonly EmailSettings _settings = emailSettings.Value;

    public async Task<bool> SendEmailAsync(
        string toEmail,
        string subject,
        string htmlContent,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using MailMessage mail = new()
            {
                From = new MailAddress(_settings.FromEmail, _settings.FromName),
                Subject = subject,
                Body = htmlContent,
                IsBodyHtml = true
            };
            mail.To.Add(toEmail);

            using SmtpClient smtpClient = new(_settings.SmtpServer, _settings.SmtpPort)
            {
                Credentials = new NetworkCredential(_settings.SmtpUsername, _settings.SmtpPassword),
                EnableSsl = _settings.EnableSsl,
                Timeout = 10000
            };

            await smtpClient.SendMailAsync(mail, cancellationToken);
            logger.LogInformation("Email sent successfully to {ToEmail} with subject: {Subject}", toEmail, subject);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {ToEmail}. Subject: {Subject}", toEmail, subject);
            return false;
        }
    }

    public async Task<bool> SendOrderConfirmationEmailAsync(
        string toEmail,
        string orderNumber,
        string customerName,
        List<(string ProductName, int Quantity, decimal Price)> items,
        OrderEmailBreakdownDto breakdown,
        CancellationToken cancellationToken = default)
    {
        string itemsHtml = GenerateItemsTable(items);
        string priceBreakdownHtml = GeneratePriceBreakdown(breakdown);
        string htmlContent = GenerateOrderConfirmationTemplate(orderNumber, customerName, itemsHtml, priceBreakdownHtml);
        return await SendEmailAsync(toEmail, $"Order Confirmation - {orderNumber}", htmlContent, cancellationToken);
    }

    private static string GenerateItemsTable(List<(string ProductName, int Quantity, decimal Price)> items)
    {
        string itemRows = string.Join("\n", items.Select((item, index) =>
        {
            decimal subtotal = item.Quantity * item.Price;
            return $@"
                <tr>
                    <td style='border: 1px solid #ddd; padding: 12px;'>{index + 1}</td>
                    <td style='border: 1px solid #ddd; padding: 12px;'>{HttpUtility.HtmlEncode(item.ProductName)}</td>
                    <td style='border: 1px solid #ddd; padding: 12px; text-align: center;'>{item.Quantity}</td>
                    <td style='border: 1px solid #ddd; padding: 12px; text-align: right;'>${item.Price:F2}</td>
                    <td style='border: 1px solid #ddd; padding: 12px; text-align: right;'>${subtotal:F2}</td>
                </tr>";
        }));

        return $@"  
            <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                <thead>
                    <tr style='background-color: #f2f2f2;'>
                        <th style='border: 1px solid #ddd; padding: 12px; text-align: left;'>#</th>
                        <th style='border: 1px solid #ddd; padding: 12px; text-align: left;'>Product</th>
                        <th style='border: 1px solid #ddd; padding: 12px; text-align: center;'>Quantity</th>
                        <th style='border: 1px solid #ddd; padding: 12px; text-align: right;'>Price</th>
                        <th style='border: 1px solid #ddd; padding: 12px; text-align: right;'>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {itemRows}
                </tbody>
            </table>";
    }

    private static string GeneratePriceBreakdown(OrderEmailBreakdownDto breakdown)
    {
        string discountRow = breakdown.DiscountAmount > 0
            ? $@"
                <tr>
                    <td style='padding: 10px 0; text-align: right; border-bottom: 1px solid #eee;'><strong>Discount:</strong></td>
                    <td style='padding: 10px 15px; text-align: right; border-bottom: 1px solid #eee; color: #27ae60;'>-${breakdown.DiscountAmount:F2}</td>
                </tr>"
            : "";

        string shippingRow = breakdown.ShippingFee > 0
            ? $@"
                <tr>
                    <td style='padding: 10px 0; text-align: right; border-bottom: 1px solid #eee;'><strong>Shipping Fee:</strong></td>
                    <td style='padding: 10px 15px; text-align: right; border-bottom: 1px solid #eee;'>${breakdown.ShippingFee:F2}</td>
                </tr>"
            : "";

        return $@"
            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;'>
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr>
                        <td style='padding: 10px 0; text-align: right; border-bottom: 1px solid #eee;'><strong>Subtotal:</strong></td>
                        <td style='padding: 10px 15px; text-align: right; border-bottom: 1px solid #eee;'>${breakdown.SubtotalAmount:F2}</td>
                    </tr>
                    {discountRow}
                    {shippingRow}
                    <tr>
                        <td style='padding: 15px 0; text-align: right;'><strong style='font-size: 16px;'>Total Amount:</strong></td>
                        <td style='padding: 15px; text-align: right;'><strong style='font-size: 16px;'>${breakdown.FinalAmount:F2}</strong></td>
                    </tr>
                </table>
            </div>";
    }

    private static string GenerateOrderConfirmationTemplate(
        string orderNumber,
        string customerName,
        string itemsHtml,
        string priceBreakdownHtml)
    {
        return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <style>
                    body {{ font-family: Arial, sans-serif; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px; }}
                    .header h1 {{ margin: 0; font-size: 24px; }}
                    .content {{ margin: 20px 0; }}
                    .order-details {{ background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }}
                    .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Order Confirmation</h1>
                    </div>
                    
                    <div class='content'>
                        <p>Hello <strong>{customerName}</strong>,</p>
                        <p>Thank you for your order! We've received your order and it's being prepared for shipment.</p>
                        
                        <div class='order-details'>
                            <p><strong>Order Number:</strong> {orderNumber}</p>
                            <p><strong>Order Date:</strong> {DateTime.UtcNow:MMMM dd, yyyy HH:mm:ss} UTC</p>
                        </div>
                        
                        <h3>Order Items:</h3>
                        {itemsHtml}
                        
                        <h3>Price Summary:</h3>
                        {priceBreakdownHtml}
                        
                        <p>You can track your order status at any time by logging into your account on our website.</p>
                        
                        <p>If you have any questions about your order, please don't hesitate to contact us.</p>
                        
                        <p>Best regards,<br><strong>Glasses E-commerce Team</strong></p>
                    </div>
                    
                    <div class='footer'>
                        <p>This is an automated email. Please do not reply directly to this email.</p>
                        <p>&copy; 2026 Glasses E-commerce. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";
    }

    public async Task<bool> SendPasswordRecoveryEmailAsync(
        string toEmail,
        string userName,
        string resetLink,
        CancellationToken cancellationToken = default)
    {
        string frontendResetLink = $"{_settings.FrontendUrl.TrimEnd('/')}/reset-password?{resetLink}";
        string htmlContent = GeneratePasswordRecoveryTemplate(userName, frontendResetLink);
        return await SendEmailAsync(toEmail, "Password Recovery Request", htmlContent, cancellationToken);
    }

    private static string GeneratePasswordRecoveryTemplate(string userName, string resetLink)
    {
        return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <style>
                    body {{ font-family: Arial, sans-serif; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px; }}
                    .header h1 {{ margin: 0; font-size: 24px; }}
                    .content {{ margin: 20px 0; }}
                    .warning {{ background-color: #fff3cd; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; }}
                    .reset-button {{ text-align: center; margin: 30px 0; }}
                    .reset-button a {{ 
                        display: inline-block;
                        background-color: #FF9800;
                        color: white;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }}
                    .reset-button a:hover {{ background-color: #E08900; }}
                    .code-section {{ 
                        background-color: #f5f5f5;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 5px;
                        word-break: break-all;
                        font-family: monospace;
                    }}
                    .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Password Recovery</h1>
                    </div>
                    
                    <div class='content'>
                        <p>Hello <strong>{userName}</strong>,</p>
                        <p>We received a request to reset your password. Click the button below to create a new password.</p>
                        
                        <div class='reset-button'>
                            <a href='{resetLink}'>Reset Password</a>
                        </div>
                        
                        <p><strong>Or copy and paste this link in your browser:</strong></p>
                        <div class='code-section'>
                            {resetLink}
                        </div>
                        
                        <div class='warning'>
                            <strong>⚠️ Security Notice:</strong>
                            <p>This password reset link will expire in 24 hours. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
                        </div>
                        
                        <p>For security reasons, we recommend:</p>
                        <ul>
                            <li>Never share your password reset link with anyone</li>
                            <li>Use a strong password combining uppercase, lowercase, numbers, and special characters</li>
                            <li>If you didn't request this, change your password immediately</li>
                        </ul>
                    </div>
                    
                    <div class='footer'>
                        <p>This is an automated email. Please do not reply directly to this email.</p>
                        <p>&copy; 2026 Glasses E-commerce. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";
    }

    public async Task<bool> SendWelcomeEmailAsync(
        string toEmail,
        string userName,
        CancellationToken cancellationToken = default)
    {
        string frontendUrl = _settings.FrontendUrl.TrimEnd('/');
        string htmlContent = GenerateWelcomeTemplate(userName, frontendUrl);
        return await SendEmailAsync(toEmail, "Welcome to Glasses E-commerce!", htmlContent, cancellationToken);
    }

    private static string GenerateWelcomeTemplate(string userName, string frontendUrl)
    {
        return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <style>
                    body {{ font-family: Arial, sans-serif; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px; }}
                    .header h1 {{ margin: 0; font-size: 28px; }}
                    .content {{ margin: 20px 0; }}
                    .welcome-box {{ background-color: #E3F2FD; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }}
                    .features {{ margin: 20px 0; }}
                    .features ul {{ list-style-type: none; padding: 0; }}
                    .features li {{ 
                        padding: 10px 0; 
                        border-bottom: 1px solid #ddd;
                        display: flex;
                        align-items: center;
                    }}
                    .features li:before {{ 
                        content: '✓';
                        display: inline-block;
                        color: #4CAF50;
                        font-weight: bold;
                        font-size: 18px;
                        margin-right: 10px;
                    }}
                    .cta-button {{ text-align: center; margin: 30px 0; }}
                    .cta-button a {{ 
                        display: inline-block;
                        background-color: #2196F3;
                        color: white;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }}
                    .cta-button a:hover {{ background-color: #1976D2; }}
                    .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Welcome!</h1>
                    </div>
                    
                    <div class='content'>
                        <p>Hello <strong>{userName}</strong>,</p>
                        
                        <div class='welcome-box'>
                            <p>Thank you for registering with Glasses E-commerce! Your account has been successfully created and you're ready to start shopping.</p>
                        </div>
                        
                        <h3>What You Can Do Now:</h3>
                        <div class='features'>
                            <ul>
                                <li>Browse our collection of premium eyeglasses and frames</li>
                                <li>Create and save your addresses for faster checkout</li>
                                <li>View your order history and track shipments in real-time</li>
                                <li>Save your favorite items for later</li>
                                <li>Enjoy exclusive member benefits and promotions</li>
                                <li>Get personalized recommendations based on your preferences</li>
                            </ul>
                        </div>
                        
                        <div class='cta-button'>
                            <a href='{frontendUrl}'>Start Shopping Now</a>
                        </div>
                        
                        <h3>Quick Tips:</h3>
                        <p>
                            <strong>• Complete Your Profile:</strong> Add your display name and profile image to personalize your account.<br>
                            <strong>• Secure Your Account:</strong> Use a strong password and enable two-factor authentication for added security.<br>
                            <strong>• Subscribe to Updates:</strong> Stay informed about new arrivals, exclusive sales, and special offers.
                        </p>
                        
                        <p>If you have any questions or need assistance, our support team is here to help. Feel free to reach out anytime.</p>
                        
                        <p>Happy shopping!<br><strong>Glasses E-commerce Team</strong></p>
                    </div>
                    
                    <div class='footer'>
                        <p>This is an automated email. Please do not reply directly to this email.</p>
                        <p>&copy; 2026 Glasses E-commerce. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";
    }
}

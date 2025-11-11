// Jack Gerber – Resend Email Sender Implementation (v1.x API)

using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Configuration;
using Resend;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BlogApp.Services;

public class EmailSender : IEmailSender
{
    private readonly IResend _resend;
    private readonly string _fromEmail = string.Empty;

    public EmailSender(IConfiguration config)
    {
        var apiKey = config["Resend:ApiKey"];
        _fromEmail = config["Resend:FromEmail"] ?? string.Empty;

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("Resend API key is not configured. Please set Resend:ApiKey in appsettings or environment variables.");
        }

        // Static factory pattern with guaranteed non-null token
        _resend = ResendClient.Create(apiKey!);
    }

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Recipient email cannot be empty.", nameof(email));

        if (string.IsNullOrWhiteSpace(_fromEmail))
            throw new InvalidOperationException("Sender email (_fromEmail) is not configured.");

        var message = new EmailMessage
        {
            From = _fromEmail,
            To = new EmailAddressList { email },
            Subject = subject,
            HtmlBody = htmlMessage
        };

        await _resend.EmailSendAsync(message);
    }
}

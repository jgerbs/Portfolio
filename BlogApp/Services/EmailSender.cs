/* ============================================================
   File:    Services/EmailSender.cs
   Purpose: IEmailSender implementation that delivers transactional
            HTML emails via the Resend API (v1.x client).

   Responsibilities:
   - Read Resend API key and sender address from configuration
   - Instantiate the ResendClient via its static factory
   - Guard against missing configuration at startup and send time
   - Implement SendEmailAsync as required by ASP.NET Identity

   Sections:
   1) USING DIRECTIVES + NAMESPACE
   2) EMAIL SENDER CLASS + CONSTRUCTOR
   3) SEND EMAIL IMPLEMENTATION
============================================================ */

/* ============================================================
   1) USING DIRECTIVES + NAMESPACE
   ============================================================ */
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Configuration;
using Resend;

namespace BlogApp.Services;

/* ============================================================
   2) EMAIL SENDER CLASS + CONSTRUCTOR
   Reads Resend:ApiKey and Resend:FromEmail from configuration.
   Throws at construction time if the API key is absent so
   misconfiguration surfaces immediately on startup.
   ============================================================ */
public class EmailSender : IEmailSender
{
    private readonly IResend _resend;
    private readonly string  _fromEmail = string.Empty;

    public EmailSender(IConfiguration config)
    {
        var apiKey = config["Resend:ApiKey"];
        _fromEmail = config["Resend:FromEmail"] ?? string.Empty;

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException(
                "Resend API key is not configured. Set Resend:ApiKey in appsettings or environment variables.");

        _resend = ResendClient.Create(apiKey!);
    }

    /* ============================================================
       3) SEND EMAIL IMPLEMENTATION
       Validates inputs, builds the Resend EmailMessage, and
       dispatches it asynchronously via the Resend client.
       ============================================================ */
    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Recipient email cannot be empty.", nameof(email));

        if (string.IsNullOrWhiteSpace(_fromEmail))
            throw new InvalidOperationException("Sender email (Resend:FromEmail) is not configured.");

        var message = new EmailMessage
        {
            From     = _fromEmail,
            To       = new EmailAddressList { email },
            Subject  = subject,
            HtmlBody = htmlMessage
        };

        await _resend.EmailSendAsync(message);
    }
}

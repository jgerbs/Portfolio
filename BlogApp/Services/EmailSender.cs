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
    private readonly string _fromEmail;

    public EmailSender(IConfiguration config)
    {
        var apiKey = config["Resend:ApiKey"];
        _fromEmail = config["Resend:FromEmail"];

        // new static factory pattern
        _resend = ResendClient.Create(apiKey);
    }

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
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

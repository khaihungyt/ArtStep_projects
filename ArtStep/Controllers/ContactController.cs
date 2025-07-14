using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System.ComponentModel.DataAnnotations;
using System.Net.Mail;

namespace ArtStep.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly ILogger<ContactController> _logger;

        public ContactController(
            ILogger<ContactController> logger)
        {
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ContactFormModel model)
        {
            try
            {
                // 1. Validate the model
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu form không hợp lệ",
                        errors = ModelState.Values.SelectMany(v => v.Errors)
                    });
                }

                // 2. Gửi email thông báo
                var emailSubject = $"Liên hệ mới từ khách hàng: {model.Subject}";
                var emailMessage = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #4a6fa5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            padding: 20px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
        }}
        .info-label {{
            font-weight: bold;
            color: #4a6fa5;
            width: 100px;
            display: inline-block;
        }}
        .message-box {{
            background-color: white;
            border: 1px solid #eee;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
        }}
        .footer {{
            margin-top: 20px;
            font-size: 0.9em;
            color: #777;
            text-align: center;
        }}
        hr {{
            border: 0;
            height: 1px;
            background-image: linear-gradient(to right, rgba(0,0,0,0), rgba(74,111,165,0.5), rgba(0,0,0,0));
            margin: 20px 0;
        }}
    </style>
</head>
<body>
    <div class='header'>
        <h2 style='margin:0;'>PHẢN HỒI KHÁCH HÀNG</h2>
    </div>
    
    <div class='content'>
        <p><span class='info-label'>Họ tên:</span> {model.Name}</p>
        <p><span class='info-label'>Email:</span> {model.Email}</p>
        <p><span class='info-label'>Chủ đề:</span> {model.Subject}</p>
        
        <hr>
        
        <div>
            <p class='info-label'>Nội dung:</p>
            <div class='message-box'>
                {model.Message}
            </div>
        </div>
        
        <div class='footer'>
            <p>Thời gian: {DateTime.Now.ToString("dd/MM/yyyy HH:mm")}</p>
            <p>© {DateTime.Now.Year} ArtStep - All rights reserved</p>
        </div>
    </div>
</body>
</html>
";

                await SendEmailAsync(
                    emailSubject,
                    emailMessage,
                    model.Email,
                    model.Name);

                // 3. Ghi log
                _logger.LogInformation($"Đã nhận liên hệ mới từ {model.Name} ({model.Email})");

                return Ok(new
                {
                    success = true,
                    message = "Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ lại sớm nhất."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý form liên hệ");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.",
                    error = ex.Message
                });
            }
        }

        private async Task SendEmailAsync(string subject, string htmlMessage, string fromEmail, string fromName)
        {
            var email = new MimeMessage();

            // Người gửi (dùng email của hệ thống)
            email.From.Add(new MailboxAddress(fromName, fromEmail));

            // Người nhận (admin)
            email.To.Add(new MailboxAddress("Admin", "duyv63718@gmail.com"));

            // Reply-to là email của người gửi form
            email.ReplyTo.Add(new MailboxAddress(fromName, fromEmail));

            email.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlMessage
            };

            email.Body = bodyBuilder.ToMessageBody();

            using var client = new MailKit.Net.Smtp.SmtpClient();
            await client.ConnectAsync("smtp.gmail.com", 587, false);
            await client.AuthenticateAsync("duyv63718@gmail.com", "kxcl ubaf rthk amkv");
            await client.SendAsync(email);
            await client.DisconnectAsync(true);
        }
    }

    public class ContactFormModel
    {
        public string Name { get; set; }
        public string Email { get; set; }

        public string Subject { get; set; }

        public string Message { get; set; }
    }
}
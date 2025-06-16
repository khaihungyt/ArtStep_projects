using ArtStep.Data;
using ArtStep.DTO;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Net;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using System.Text.RegularExpressions;

namespace ArtStep.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _memoryCache;
        private readonly ArtStepDbContext _context;
        private readonly Cloudinary _cloudinary;
        public AuthController(IConfiguration configuration, ArtStepDbContext context, IMemoryCache memoryCache, Cloudinary cloudinary)
        {
            _memoryCache = memoryCache;
            _configuration = configuration;
            _context = context;
            _cloudinary = cloudinary;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestCustom request)
        {
            var userAccount = _context.Accounts
                                    .Include(a => a.User)
                                    .FirstOrDefault(a => a.UserName == request.UserName && a.Password == request.Password);

            if (userAccount == null || userAccount.User == null)
            {
                return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không đúng. Xin vui lòng thử lại !" });
            }

            var token = GenerateJwtToken(userAccount.User!);

            var userInfo = new
            {
                userAccount.User.UserId,
                userAccount.User.Name,
                userAccount.User.Email,
                userAccount.User.Role,
                userAccount.User.ImageProfile,
            };

            return Ok(new
            {
                token = token,
                user = userInfo
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterFromUser([FromForm] RegisterRequestCustom request)
        {
            try
            {

                if (_context.Accounts.Any(a => a.UserName == request.UserName))
                {
                    return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });
                }

                string? imageUrl = null;
                if (request.ImageProfile != null)
                {
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(request.ImageProfile.FileName, request.ImageProfile.OpenReadStream()),
                        PublicId = $"profile_images/{Guid.NewGuid()}"
                    };
                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    imageUrl = uploadResult.SecureUrl?.ToString();
                }

                var user = new User
                {
                    UserId = Guid.NewGuid().ToString(),
                    Name = request.Name,
                    Email = request.Email,
                    PhoneNo = request.PhoneNo,
                    Role = request.Role.ToLower(),
                    isActive = 1,
                    ImageProfile = imageUrl
                };

                var account = new Data.Account
                {
                    AccountId = Guid.NewGuid().ToString(),
                    UserName = request.UserName,
                    Password = request.Password,
                    UserId = user.UserId,
                    isStatus = 1,
                    User = user
                };

                _context.User.Add(user);
                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đăng ký thành công!" });
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Convert.FromBase64String(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Name ?? user.Email ?? "Unknown"),
                new Claim(ClaimTypes.NameIdentifier, user.UserId ?? ""),
                new Claim(ClaimTypes.Role, user.Role ?? "User")
            };
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(0.5),
                signingCredentials: credentials
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpGet("forgot")]
        public async Task<IActionResult> ForgotPassword(string email)
        {
            var user = await _context.User.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return NotFound(new { message = "Email không tồn tại" });

            string code = new Random().Next(100000, 999999).ToString();

            bool sent = await SendVerificationCodeAsync(email, code);
            if (!sent)
                return StatusCode(500, new { message = "Không thể gửi mã xác nhận" });

            _memoryCache.Set($"reset_{email}", code, TimeSpan.FromMinutes(10));

            return Ok(new { message = "Đã gửi mã xác nhận đến email" });
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _context.User.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return NotFound(new { message = "Email không tồn tại" });

            if (!_memoryCache.TryGetValue($"reset_{request.Email}", out string? cachedCode) || cachedCode != request.ResetCode)
            {
                return BadRequest(new { message = "Mã xác nhận không đúng hoặc đã hết hạn" });
            }

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == user.UserId);
            if (account == null)
                return NotFound(new { message = "Tài khoản không tồn tại" });

            account.Password = request.NewPassword;
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();

            _memoryCache.Remove($"reset_{request.Email}");

            return Ok(new { message = "Mật khẩu đã được đặt lại thành công" });
        }

        // Send verification code to email
        private async Task<bool> SendVerificationCodeAsync(string toEmail, string code)
        {
            var fromEmail = "duyv63718@gmail.com";
            var fromAddress = new MailAddress(fromEmail, "ArtStep Support");
            var fromPassword = "ixcd mvvb usrn upqj";
            var subject = "Mã xác nhận đặt lại mật khẩu ArtStep";
            var body = $"Mã xác nhận của bạn là: {code}";

            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(fromEmail, fromPassword),
                EnableSsl = true,
            };
            var mail = new MailMessage
            {
                From = fromAddress,
                Subject = subject,
                Body = body,
                IsBodyHtml = false
            };
            mail.To.Add(toEmail);
            try
            {
                await smtpClient.SendMailAsync(mail);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

    }
}


using ArtStep.Data;
using ArtStep.DTO;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ArtStep.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ArtStepDbContext _context;
        public AuthController(IConfiguration configuration, ArtStepDbContext context)
        {
            _configuration = configuration;
            _context = context;
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
        public async Task<IActionResult> RegisterFromUser([FromBody] RegisterRequestCustom request)
        {
            if (_context.Accounts.Any(a => a.UserName == request.UserName))
            {
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });
            }

            try
            {
                // Create User
            var user = new User
            {
                UserId = Guid.NewGuid().ToString(),
                Name = request.Name,
                Email = request.Email,
                Role = "user",
                ImageProfile = request.ImageProfile
            };

                // Create Account
            var account = new Account
            {
                AccountId = Guid.NewGuid().ToString(),
                UserName = request.UserName,
                Password = request.Password,
                UserId = user.UserId,
                User = user
            };

            _context.User.Add(user);
            _context.Accounts.Add(account);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công!" });
        }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Đăng ký thất bại: " + ex.Message });
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

    }
}

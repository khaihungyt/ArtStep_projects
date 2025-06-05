using ArtStep.Data;
using ArtStep.DTO;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

namespace ArtStep.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly ArtStepDbContext _context;
        private readonly Cloudinary _cloudinary;

        public ProfileController(ArtStepDbContext context, Cloudinary cloudinary)
        {
            _context = context;
            _cloudinary = cloudinary;
        }

        [HttpGet("GetProfile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
            }

            var userId = userIdClaim.Value;

            var user = await _context.User
                .Where(u => u.UserId == userId)
                .Select(u => new
                {
                    u.UserId,
                    u.Name,
                    u.Email,
                    u.PhoneNo,
                    u.Role,
                    u.ImageProfile,
                    isActive = u.isActive == 1 ? true : false
                })
                .FirstOrDefaultAsync();
            if (user == null)
            {
                return NotFound(new { message = "Người dùng không tồn tại." });
            }
            return Ok(user);
        }


        [HttpPost("UpdateProfile")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDTO request)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
            }
            var userId = userIdClaim.Value;

            var user = await _context.User.FirstOrDefaultAsync(u => u.UserId.ToString() == userId);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            if (request.Avatar != null && request.Avatar.Length > 0)
            {
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(request.Avatar.FileName, request.Avatar.OpenReadStream()),
                    PublicId = $"profile_images/{user.UserId}_{System.Guid.NewGuid()}"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    user.ImageProfile = uploadResult.SecureUrl.ToString();
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Không thể upload ảnh lên Cloudinary." });
                }
            }

            user.Name = request.Name?.Trim() ?? user.Name;
            user.Email = request.Email?.Trim() ?? user.Email;
            user.PhoneNo = request.PhoneNo?.Trim() ?? user.PhoneNo;

            try
            {
                _context.User.Update(user);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thông tin thành công!" });
            }
            catch
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Lỗi khi cập nhật database." });
            }
        }

        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePassword([FromForm] string oldPassword, [FromForm] string newPassword)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
            }
            var userId = userIdClaim.Value;
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.User.UserId.ToString() == userId);

            if (account == null)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản." });
            }
            if (account.Password != oldPassword)
            {
                return BadRequest(new { message = "Mật khẩu cũ không đúng." });
            }
            account.Password = newPassword;
            try
            {
                _context.Accounts.Update(account);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Đổi mật khẩu thành công!" });
            }
            catch
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Lỗi khi cập nhật database." });
            }
        }
    }
}

using ArtStep.Data;
using ArtStep.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Validations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ArtStep.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DesignerController : ControllerBase
    {
        private readonly ArtStepDbContext _context;

        public DesignerController(ArtStepDbContext context)
        {
            _context = context;
        }
        // GET: api/<DesignerController>
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ShoeCustomDTO>> GetAllDesignAsync()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
            }

            var userId = userIdClaim.Value;
            var listShoe = await _context.ShoeCustom
            .AsNoTracking() // Improve performance for read-only operations
            .Include(sc => sc.Designer)
            .Include(sc => sc.Category)
            .Include(sc => sc.Images)
            .Where(sc => sc.Designer.UserId == userId)
            .Select(sc => new ShoeCustomDTO
            {
                ShoeId = sc.ShoeId,
                ShoeName = sc.ShoeName,
                ShoeDescription = sc.ShoeDescription,
                Quantity = sc.Quantity,
                PriceAShoe = sc.PriceAShoe,
                IsHidden = sc.IsHidden,
                Category = new CategoryDTO
                {
                    CategoryId = sc.Category.CategoryId,
                    CategoryName = sc.Category.CategoryName
                },
                ShoeImages = sc.Images.Select(i => new ShoeImageDTO
                {
                    ImageId = i.ImageId,
                    ImageLink = i.ImageLink
                }).ToList() // Sort thumbnails first
            }).ToListAsync();

            if (listShoe == null)
            {
                return NotFound();
            }
            return Ok(listShoe);
        }


        [HttpGet("view_revenue")]
        [Authorize]
        public async Task<ActionResult<OrderRevenueResponseDTO>> GetAllSalesData()
        {
            try
            {
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
                }

                var userId = userIdClaim.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }
                var revenue = await _context.OrderDetail
                                     .Include(od => od.ShoeCustom).ToListAsync();
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred list" });
            }
        }

        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateDesign([FromBody] EditDesignRequestDTO updateDto)
        {
            try
            {
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
                }

                var userId = userIdClaim.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                // 2. Tìm kiếm thiết kế
                var design = await _context.ShoeCustom
                     .Include(sc => sc.Designer)
                     .Include(sc => sc.Category)
                    .Include(sc => sc.Images).FirstOrDefaultAsync(s => s.ShoeId == updateDto.ShoeId && s.Designer.UserId == userId);

                if (design == null)
                {
                    return NotFound(new { Message = "Design not found or you don't have permission" });
                }

                // 3. Cập nhật thông tin cơ bản
                design.ShoeName = updateDto.ShoeName;
                design.ShoeDescription = updateDto.ShoeDescription;
                design.PriceAShoe = updateDto.PriceAShoe;
                design.Quantity = updateDto.Quantity;
                // 4. Cập nhật category
                var category = await _context.Categories.FindAsync(updateDto.CategoryId);

                if (category == null)
                {
                    return BadRequest(new { Message = "Invalid category" });
                }
                design.Category = category;

                // 5. Xử lý hình ảnh (đã bỏ IsMain)
                await ProcessShoeImages(design, updateDto.ShoeImages);

                // 6. Lưu thay đổi
                await _context.SaveChangesAsync();

                // 7. Trả về kết quả
                var result = new
                {
                    design.ShoeId,
                    design.ShoeName,
                    design.ShoeDescription,
                    design.PriceAShoe,
                    design.Quantity,
                    Category = new { design.Category.CategoryId, design.Category.CategoryName },
                    ShoeImages = design.Images.Select(i => new { i.ImageId, i.ImageLink })
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while updating the design" });
            }
        }

        // DELETE api/<DesignerController>/5
        [HttpPatch("{ShoeId}")]
        [Authorize]
        public async Task<IActionResult> HideDesign(string ShoeId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
        {
                return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
            }

            var userId = userIdClaim.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Invalid token" });
            }

            // 2. Tìm kiếm thiết kế của người dùng
            var design = await _context.ShoeCustom
                .Include(s => s.Designer)
                .FirstOrDefaultAsync(s => s.ShoeId == ShoeId && s.Designer.UserId == userId);

            if (design == null)
            {
                return NotFound(new { Message = "Design not found or you don't have permission" });
            }

            // 3. Ẩn thiết kế
            design.IsHidden = 1;

            // 4. Lưu thay đổi
            await _context.SaveChangesAsync();

            // 5. Trả về kết quả
            return Ok(new { Message = "Design has been hidden successfully" });
        }


        [HttpPost("Create_Design")]
        [Authorize]
        public async Task<IActionResult> CreateDesign([FromBody] CreateDesignRequestDTO model)
        {



            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
            }

            var userId = userIdClaim.Value;

            // 1. Xác thực người dùng (giả lập userId)
            // var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // userId = "user002";
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Invalid token" });
            }

            // 2. Tìm designer trong database (giả sử Designer có UserId)
            var designer = await _context.User.FirstOrDefaultAsync(d => d.UserId == userId);
            if (designer == null)
            {
                return BadRequest(new { Message = "Designer not found" });
            }

            // 3. Tạo design mới
            var newDesign = new ShoeCustom
            {
                ShoeId = Guid.NewGuid().ToString(), // hoặc tuỳ thuộc key của bạn
                ShoeName = model.ShoeName,
                ShoeDescription = model.ShoeDescription,
                CategoryId = model.CategoryId,
                PriceAShoe = model.PriceAShoe,
                Quantity = model.Quantity,
                IsHidden = 0,
                Designer = designer,
                // Nếu bạn có ảnh base64 thì lưu vào trường tương ứng ở đây
                Images = model.Images.Select(base64 => new ShoeImage
                {
                    ImageId = Guid.NewGuid().ToString(),
                    ImageLink = base64,
                }).ToList(),
            };

            // 4. Thêm vào db context và lưu
            _context.ShoeCustom.Add(newDesign);
            await _context.SaveChangesAsync();
            var response = new ShoeCustomDTO
            {
                ShoeName = newDesign.ShoeName,
                ShoeDescription = newDesign.ShoeDescription,
                CategoryId = newDesign.CategoryId,
                PriceAShoe = newDesign.PriceAShoe,
                Quantity = newDesign.Quantity,
            };  
            // 5. Trả về kết quả
            return Ok(response);
        }

        private async Task ProcessShoeImages(ShoeCustom design, List<ShoeImageDTO> updateImages)
        {
            //// 1. Xóa ảnh không còn tồn tại
            //var existingImages = design.Images.ToList();
            //foreach (var existingImg in existingImages)
            //{
            //    var updateImg = updateImages.FirstOrDefault(i => i.ImageId == existingImg.ImageId);
            //    Console.WriteLine(updateImg.ImageId);
            //    if (updateImg != null && existingImg.ImageLink != updateImg.ImageLink)
            //    {
            //        existingImg.ImageLink = updateImg.ImageLink;
            //    }
            //}
            design.Images.Clear();

            var image = _context.ShoeImages.Where(s => s.ShoeCustomId == null).ToList();
            image.Clear();
            // 2. Thêm ảnh mới
            foreach (var imgDto in updateImages)
            {
                // Lưu trực tiếp base64 vào database
                design.Images.Add(new ShoeImage
                {

                    ImageId = Guid.NewGuid().ToString(),
                    ImageLink = imgDto.ImageLink, // Lưu base64
                    ShoeCustomId = design.ShoeId,
                });
            }
        }
        // GET api/<DesignerController>/5
        [HttpGet("{DesignerId}")]
        [Authorize]
        public async Task<ActionResult<ShoeCustomDTO>> GetDesignById(string DesignerId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
            }
            var userId = userIdClaim.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Invalid token" });
            }
            var design = await _context.ShoeCustom
                .AsNoTracking()
                .Include(sc => sc.Designer)
                .Include(sc => sc.Category)
                .Include(sc => sc.Images)
                .FirstOrDefaultAsync(s => s.ShoeId == DesignerId && s.Designer.UserId == userId);
            if (design == null)
            {
                return NotFound();
            }
            var designDto = new ShoeCustomDTO
            {
                ShoeId = design.ShoeId,
                ShoeName = design.ShoeName,
                ShoeDescription = design.ShoeDescription,
                Quantity = design.Quantity,
                PriceAShoe = design.PriceAShoe,
                IsHidden = design.IsHidden,
                Category = new CategoryDTO
                {
                    CategoryId = design.Category.CategoryId,
                    CategoryName = design.Category.CategoryName
                },
                ShoeImages = design.Images.Select(i => new ShoeImageDTO
                {
                    ImageId = i.ImageId,
                    ImageLink = i.ImageLink
                }).ToList()
            };
            return Ok(designDto);
        }

    }
}

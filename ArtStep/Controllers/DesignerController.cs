using ArtStep.Data;
using ArtStep.DTO;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.OpenApi.Validations;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text.RegularExpressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ArtStep.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DesignerController : ControllerBase
    {
        private readonly ArtStepDbContext _context;
        private readonly Cloudinary _cloudinary;
        private readonly IMemoryCache _memoryCache;

        public DesignerController(ArtStepDbContext context, IMemoryCache memoryCache, Cloudinary cloudinary)
        {
            _context = context;
            _memoryCache = memoryCache;
            _cloudinary=cloudinary;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<ShoeCustomDTO>>> GetAllDesignAsync()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
            }

            var userId = userIdClaim.Value;
            string cacheKey = $"user_designs_{userId}";

            // Nếu có cache rồi thì dùng
            if (_memoryCache.TryGetValue(cacheKey, out List<ShoeCustomDTO> cachedList))
            {
                return Ok(cachedList);
            }

            // Nếu chưa có thì gọi DB
            var listShoe = await _context.ShoeCustom
                .AsNoTracking()
                .AsSplitQuery()
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
                    }).ToList()
                }).OrderByDescending(c=>c.PriceAShoe).ToListAsync();

            if (listShoe == null)
            {
                return NotFound();
            }

            // Cấu hình cache
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(10))
                .SetSlidingExpiration(TimeSpan.FromMinutes(2));

            _memoryCache.Set(cacheKey, listShoe, cacheOptions);

            return Ok(listShoe);
        }


        [HttpGet("view_revenue")]
        [Authorize]
        public async Task<ActionResult<OrderRevenueResponseDTO>> GetAllSalesData([FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var designerIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (designerIdClaim == null || string.IsNullOrEmpty(designerIdClaim.Value))
                {
                    return Unauthorized(new { message = "Invalid or expired token" });
                }

                var designerId = designerIdClaim.Value;

                // Set default date range if not provided
                endDate ??= DateTime.UtcNow;
                startDate ??= endDate.Value.AddMonths(-1); // Default to last 30 days

                // Validate date range
                if (startDate > endDate)
                {
                    return BadRequest("Start date cannot be after end date");
                }
                var revenueData = await _context.OrderDetail
                    .Include(od => od.ShoeCustom)
                        .ThenInclude(s => s.Designer)
                    .Include(od => od.Order)
                    .Where(od => od.ShoeCustom.Designer.UserId == designerId &&
                od.Order.Status == "Completed" &&
                od.Order.CreateAt >= startDate &&
                od.Order.CreateAt <= endDate)
                    .Select(od => new OrderRevenueResponseDTO
                    {
                        ShoeName = od.ShoeCustom.ShoeName,
                        Quantity = od.QuantityBuy,
                        PriceAShoe = od.CostaShoe,
                        dateTime = od.Order.CreateAt
                    }).OrderByDescending(x => x.dateTime)
                    .ToListAsync();

                return Ok(revenueData);
            }
            catch (Exception ex)
            {
                // Consider logging the exception (ex) here for debugging
                return StatusCode(500, new { Message = "An error occurred while retrieving sales data" });
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
                design.IsHidden = 0; // Giả sử bạn muốn hiển thị thiết kế sau khi cập nhật
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
                string cacheKey = $"user_designs_{userId}";
                _memoryCache.Remove(cacheKey);
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
            // 5. Xoá cache cũ
            string cacheKey = $"user_designs_{userId}";
            _memoryCache.Remove(cacheKey);
            await GetAllDesignAsync();
            // 5. Trả về kết quả
            return Ok(new { Message = "Design has been hidden successfully" });
        }


        //[HttpPost("Create_Design")]
        //[Authorize]
        //public async Task<IActionResult> CreateDesign([FromBody] CreateDesignRequestDTO model)
        //{
        //    var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        //    if (userIdClaim == null)
        //    {
        //        return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
        //    }

        //    var userId = userIdClaim.Value;

        //    // 1. Xác thực người dùng (giả lập userId)
        //    // var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        //    // userId = "user002";
        //    if (string.IsNullOrEmpty(userId))
        //    {
        //        return Unauthorized(new { Message = "Invalid token" });
        //    }

        //    // 2. Tìm designer trong database (giả sử Designer có UserId)
        //    var designer = await _context.User.FirstOrDefaultAsync(d => d.UserId == userId);
        //    if (designer == null)
        //    {
        //        return BadRequest(new { Message = "Designer not found" });
        //    }

        //    // 3. Tạo design mới
        //    var newDesign = new ShoeCustom
        //    {
        //        ShoeId = Guid.NewGuid().ToString(), // hoặc tuỳ thuộc key của bạn
        //        ShoeName = model.ShoeName,
        //        ShoeDescription = model.ShoeDescription,
        //        CategoryId = model.CategoryId,
        //        PriceAShoe = model.PriceAShoe,
        //        Quantity = model.Quantity,
        //        IsHidden = 0,
        //        Designer = designer,
        //        // Nếu bạn có ảnh base64 thì lưu vào trường tương ứng ở đây
        //        Images = model.Images.Select(base64 => new ShoeImage
        //        {
        //            ImageId = Guid.NewGuid().ToString(),
        //            ImageLink = base64,
        //        }).ToList(),
        //    };

        //    // 4. Thêm vào db context và lưu
        //    _context.ShoeCustom.Add(newDesign);
        //    await _context.SaveChangesAsync();
        //    // 5. Xóa cache danh sách thiết kế cũ của user này
        //    string cacheKey = $"user_designs_{userId}";
        //    _memoryCache.Remove(cacheKey);
        //    await GetAllDesignAsync();
        //    var response = new ShoeCustomDTO
        //    {
        //        ShoeName = newDesign.ShoeName,
        //        ShoeDescription = newDesign.ShoeDescription,
        //        CategoryId = newDesign.CategoryId,
        //        PriceAShoe = newDesign.PriceAShoe,
        //        Quantity = newDesign.Quantity,
        //    };
        //    // 5. Trả về kết quả
        //    return  Ok(response);
        //}




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
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Invalid token" });
            }

            var designer = await _context.User.FirstOrDefaultAsync(d => d.UserId == userId);
            if (designer == null)
            {
                return BadRequest(new { Message = "Designer not found" });
            }

            var newDesign = new ShoeCustom
            {
                ShoeId = Guid.NewGuid().ToString(),
                ShoeName = model.ShoeName,
                ShoeDescription = model.ShoeDescription,
                CategoryId = model.CategoryId,
                PriceAShoe = model.PriceAShoe,
                Quantity = model.Quantity,
                IsHidden = 0,
                Designer = designer,
                Images = new List<ShoeImage>() // sẽ thêm từng ảnh sau khi upload
            };

            // Upload từng ảnh base64 lên Cloudinary và thêm vào newDesign.Images
            foreach (var base64 in model.Images)
            {
                if (string.IsNullOrWhiteSpace(base64)) continue;

                var match = Regex.Match(base64, @"data:image/(?<type>.+?);base64,(?<data>.+)");
                if (!match.Success) continue;

                var imageBytes = Convert.FromBase64String(match.Groups["data"].Value);
                using var ms = new MemoryStream(imageBytes);

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription($"{Guid.NewGuid()}.png", ms),
                    Folder = "image_shoe",
                    UseFilename = true,
                    UniqueFilename = true,
                    Overwrite = false
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult.StatusCode == HttpStatusCode.OK)
                {
                    newDesign.Images.Add(new ShoeImage
                    {
                        ImageId = Guid.NewGuid().ToString(),
                        ImageLink = uploadResult.SecureUrl.ToString(),
                        ShoeCustomId = newDesign.ShoeId
                    });
                }
            }

            _context.ShoeCustom.Add(newDesign);
            await _context.SaveChangesAsync();

            // Xoá cache danh sách thiết kế cũ
            string cacheKey = $"user_designs_{userId}";
            _memoryCache.Remove(cacheKey);
            await GetAllDesignAsync();

            var response = new ShoeCustomDTO
            {
                ShoeName = newDesign.ShoeName,
                ShoeDescription = newDesign.ShoeDescription,
                CategoryId = newDesign.CategoryId,
                PriceAShoe = newDesign.PriceAShoe,
                Quantity = newDesign.Quantity
            };
            return Ok(response);
        }




















        private async Task ProcessShoeImages(ShoeCustom design, List<ShoeImageDTO> updateImages)
        {
            // Xóa tất cả ảnh hiện tại
            design.Images.Clear();

            // Xóa các ảnh chưa gán vào bất kỳ thiết kế nào (tùy bạn có cần hay không)
            var orphanImages = _context.ShoeImages.Where(s => s.ShoeCustomId == null).ToList();
            _context.ShoeImages.RemoveRange(orphanImages);

            foreach (var imgDto in updateImages)
            {
                if (string.IsNullOrEmpty(imgDto.ImageLink)) continue;

                // Tách base64 header
                var base64Data = Regex.Match(imgDto.ImageLink, @"data:image/(?<type>.+?);base64,(?<data>.+)").Groups["data"].Value;
                var imageBytes = Convert.FromBase64String(base64Data);

                // Upload to Cloudinary
                using var ms = new MemoryStream(imageBytes);
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription($"{Guid.NewGuid()}.png", ms),
                    Folder = "image_shoe", // Folder trong Cloudinary
                    UseFilename = true,
                    UniqueFilename = true,
                    Overwrite = false
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode == HttpStatusCode.OK)
                {
                    design.Images.Add(new ShoeImage
                    {
                        ImageId = Guid.NewGuid().ToString(),
                        ImageLink = uploadResult.SecureUrl.ToString(), // Lưu URL
                        ShoeCustomId = design.ShoeId
                    });
                }
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


        //GET api/DesignerController
        [HttpGet("get_all_designs")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<DesignerDTO>>> GetAllDesigners()
        {
            try
            {
                var designers = await _context.User
                                .Where(u => u.Role == "Designer")
                                .Select(u => new
                                {
                                    UserId = u.UserId,
                                    Name = u.Name,
                                    isActive = u.isActive,
                                    AverageFeedbackStars = _context.Feedbacks
                                        .Where(f => f.DesignerReceiveFeedbackId == u.UserId)
                                        .Average(f => (double?)f.FeedbackStars) ?? 0
                                })
                                .ToListAsync();
                return Ok(designers);

            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving designers" });
            }
        }

        // Put api/DesignerController/update_designer_status
        [HttpPut("update_designer_status")]
        [Authorize]
        public async Task<IActionResult> UpdateDesignerStatus([FromBody] DesignerDTO request)
        {
            try
            {
                var designer = await _context.User.FindAsync(request.UserId);
                if (designer == null)
                {
                    return NotFound(new { Message = "Designer not found" });
                }
                designer.isActive = request.isActive;
                _context.User.Update(designer);
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Designer status updated successfully" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while updating designer status" });
            }
        }



        [HttpGet("designer_detail/{designerId}")]
        public async Task<ActionResult<DesignerResponseDTO>> GetDesignerAndFeedbackById(string designerId)
        {
            try
            {
                string cacheKey = $"designer_detail_{designerId}";
                if (_memoryCache.TryGetValue(cacheKey, out DesignerResponseDTO cachedResponse))
                {
                    return Ok(cachedResponse);
                }


                var designer = await _context.User
                    .AsNoTracking()
                    .AsSplitQuery()
                    .Include(u => u.ShoeCustoms)
                        .ThenInclude(sc => sc.Images)
                    .Include(u => u.ReceivedFeedbacks)
                        .ThenInclude(fb => fb.UserSend)
                    .FirstOrDefaultAsync(u => u.UserId == designerId);

                if (designer == null)
                {
                    return NotFound(new { Message = "Designer not found" });
                }

                // Calculate average rating
                double averageRating = (double)(designer.ReceivedFeedbacks.Any()
                        ? designer.ReceivedFeedbacks.Average(f => f.FeedbackStars)
                            : 0);

                var feedbackList = designer.ReceivedFeedbacks?
                   .Select(fb => new FeedbackDTO
                   {
                       FeedbackId = fb.FeedbackId,
                       FeedbackDescription = fb.FeedbackDescription ?? string.Empty,
                       FeedbackStars = (int)fb.FeedbackStars,
                       User = fb.UserSend != null ? new UserDTO
                       {
                           UserId = fb.UserSend.UserId ?? string.Empty,
                           UserName = fb.UserSend.Name ?? "Không xác định",
                           Avatar = fb.UserSend.ImageProfile ?? string.Empty
                       } : new UserDTO()
                   }).ToList();

                var shoeCustomList = designer.ShoeCustoms?
                    .Select(shoe => new ShoeCustomDTO
                    {
                        ShoeId = shoe.ShoeId,
                        ShoeName = shoe.ShoeName,
                        PriceAShoe = shoe.PriceAShoe,
                        ShoeImages = shoe.Images?
                            .Select(img => new ShoeImageDTO
                            {
                                ImageId = img.ImageId,
                                ImageLink = img.ImageLink
                            }).ToList() ?? new List<ShoeImageDTO>()
                    }).ToList() ?? new List<ShoeCustomDTO>();

                var response = new DesignerResponseDTO
                {
                    DesignerId = designer.UserId,
                    DesignerName = designer.Name,
                    Email = designer.Email,
                    Phone = designer.PhoneNo,
                    AvatarImage = designer.ImageProfile,
                    AverageRating = Math.Round(averageRating, 1),
                    FeedBackList = feedbackList,
                    ShoeCustomList = shoeCustomList
                };
                _memoryCache.Set(cacheKey, response, new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10),
                    SlidingExpiration = TimeSpan.FromMinutes(2)
                });
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "An error occurred while processing your request.",
                    Error = ex.Message
                });
            }
        }



        //[HttpGet("designer_detail/{designerId}")]
        //public async Task<ActionResult<DesignerResponseDTO>> GetDesignerAndFeedbackById(string designerId)
        //{
        //    try
        //    {
        //        string cacheKey = $"designer_detail_{designerId}";
        //        if (_memoryCache.TryGetValue(cacheKey, out DesignerResponseDTO cachedResponse))
        //        {
        //            return Ok(cachedResponse);
        //        }


        //        var designer = await _context.User
        //            .AsNoTracking()
        //            .AsSplitQuery()
        //            .Include(u => u.ShoeCustoms)
        //                .ThenInclude(sc => sc.Images)
        //            .Include(u => u.ReceivedFeedbacks)
        //                .ThenInclude(fb => fb.UserSend)
        //            .FirstOrDefaultAsync(u => u.UserId == designerId);

        //        if (designer == null)
        //        {
        //            return NotFound(new { Message = "Designer not found" });
        //        }

        //        // Calculate average rating
        //        double averageRating = (double)(designer.ReceivedFeedbacks.Any()
        //                ? designer.ReceivedFeedbacks.Average(f => f.FeedbackStars)
        //                    : 0);

        //        var feedbackList = designer.ReceivedFeedbacks?
        //           .Select(fb => new FeedbackDTO
        //           {
        //               FeedbackId = fb.FeedbackId,
        //               FeedbackDescription = fb.FeedbackDescription ?? string.Empty,
        //               FeedbackStars = (int)fb.FeedbackStars,
        //               User = fb.UserSend != null ? new UserDTO
        //               {
        //                   UserId = fb.UserSend.UserId ?? string.Empty,
        //                   UserName = fb.UserSend.Name ?? "Không xác định",
        //                   Avatar = fb.UserSend.ImageProfile ?? string.Empty
        //               } : new UserDTO()
        //           }).ToList();

        //        var shoeCustomList = designer.ShoeCustoms?
        //            .Select(shoe => new ShoeCustomDTO
        //            {
        //                ShoeId = shoe.ShoeId,
        //                ShoeName = shoe.ShoeName,
        //                PriceAShoe = shoe.PriceAShoe,
        //                ShoeImages = shoe.Images?
        //                    .Select(img => new ShoeImageDTO
        //                    {
        //                        ImageId = img.ImageId,
        //                        ImageLink = img.ImageLink
        //                    }).ToList() ?? new List<ShoeImageDTO>()
        //            }).ToList() ?? new List<ShoeCustomDTO>();

        //        var response = new DesignerResponseDTO
        //        {
        //            DesignerId = designer.UserId,
        //            DesignerName = designer.Name,
        //            Email = designer.Email,
        //            Phone = designer.PhoneNo,
        //            AvatarImage = designer.ImageProfile,
        //            AverageRating = Math.Round(averageRating, 1),
        //            FeedBackList = feedbackList,
        //            ShoeCustomList = shoeCustomList
        //        };
        //        _memoryCache.Set(cacheKey, response, new MemoryCacheEntryOptions
        //        {
        //            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10),
        //            SlidingExpiration = TimeSpan.FromMinutes(2)
        //        });
        //        return Ok(response);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new
        //        {
        //            Message = "An error occurred while processing your request.",
        //            Error = ex.Message
        //        });
        //    }
        //}

        // GET: api/Designer/public
        [HttpGet("public")]
        public async Task<ActionResult<List<DesignerPublicDTO>>> GetAllDesignersPublic()
        {
            try
            {
                var designers = await _context.User
                    .AsNoTracking()
                    .Where(u => u.Role == "designer" && u.isActive != 0)
                    .Select(d => new DesignerPublicDTO
                    {
                        UserId = d.UserId,
                        Name = d.Name,
                        ImageProfile = d.ImageProfile,
                        TotalDesigns = d.ShoeCustoms != null ? d.ShoeCustoms.Count(sc => sc.IsHidden == 0) : 0
                    })
                    .ToListAsync();

                return Ok(designers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving designers" });
            }
        }


        [HttpGet("designer_feedback")]
        [Authorize]
        public async Task<ActionResult<List<FeedbackDTO>>> GetAllFeedBackForADesigner([FromQuery] int? rating)
        {
            var designerIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (designerIdClaim == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
            }

            var designerId = designerIdClaim.Value;

            var query = _context.Feedbacks
             .Include(fb => fb.UserSend)
             .Where(fb => fb.DesignerReceiveFeedbackId == designerId);


            if (rating.HasValue)
            {
                query = query.Where(fb => fb.FeedbackStars == rating.Value);
            }

            var feedbackList = await query.ToListAsync();



            var feedbackDTOs = feedbackList.Select(fb => new FeedbackDTO
            {
                FeedbackId = fb.FeedbackId,
                FeedbackDescription = fb.FeedbackDescription,
                FeedbackStars = (int)fb.FeedbackStars,
                User = new UserDTO
                {
                    UserName = fb.UserSend.Name,
                    Avatar = fb.UserSend.ImageProfile
                }
            }).ToList();

            return Ok(feedbackDTOs);
        }
    }
}
//a
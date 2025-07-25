using ArtStep.Data;
using ArtStep.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System;

namespace ArtStep.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Designer")]
    public class DesignerDashboardController : ControllerBase
    {
        private readonly ArtStepDbContext _context;

        public DesignerDashboardController(ArtStepDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var totalDesigns = await _context.ShoeCustom.CountAsync(s => s.Designer.UserId == userId && s.IsHidden == 0);
            var totalOrders = await _context.OrderDetail.CountAsync(od => od.ShoeCustom.Designer.UserId == userId);
            var avgRating = await _context.Feedbacks.Where(f => f.DesignerReceiveFeedbackId == userId).AverageAsync(f => (double?)f.FeedbackStars) ?? 0;

            var popularDesigns = await _context.OrderDetail
                .Where(od => od.ShoeCustom.Designer.UserId == userId)
                .GroupBy(od => new { od.ShoeCustom.ShoeName })
                .Select(g => new { Name = g.Key.ShoeName, Orders = g.Sum(od => od.QuantityBuy ?? 0) })
                .OrderByDescending(x => x.Orders)
                .Take(4).ToListAsync();

            var recentActivity = await _context.OrderDetail
                .Include(od => od.ShoeCustom).Include(od => od.Order)
                .Where(od => od.ShoeCustom.Designer.UserId == userId)
                .OrderByDescending(od => od.Order.CreateAt)
                .Take(5)
                .Select(od => new { Text = "Đơn hàng mới cho " + od.ShoeCustom.ShoeName, Time = od.Order.CreateAt })
                .ToListAsync();

            return Ok(new { totalDesigns, totalOrders, averageRating = Math.Round(avgRating, 1), popularDesigns, recentActivity });
        }

        [HttpGet("view_revenue")]
        public async Task<ActionResult<IEnumerable<OrderRevenueResponseDTO>>> GetAllSalesData([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            var designerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(designerId)) return Unauthorized();

            endDate ??= DateTime.UtcNow;
            startDate ??= endDate.Value.AddDays(-30);

            if (startDate > endDate) return BadRequest("Start date cannot be after end date");

            var revenueData = await _context.OrderDetail
                .Include(od => od.ShoeCustom)
                .Include(od => od.Order)
                .Where(od => od.ShoeCustom.Designer.UserId == designerId &&
                             od.Order.CreateAt >= startDate &&
                             od.Order.CreateAt < endDate.Value.AddDays(1))
                .Select(od => new OrderRevenueResponseDTO
                {
                    ShoeName = od.ShoeCustom.ShoeName,
                    QuantitySold = od.QuantityBuy,
                    PricePerShoe = od.ShoeCustom.PriceAShoe,
                    DateTime = od.Order.CreateAt
                })
                .OrderByDescending(x => x.DateTime)
                .ToListAsync();

            return Ok(revenueData);
        }
    }
}
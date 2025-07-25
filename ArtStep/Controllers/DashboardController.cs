using ArtStep.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace ArtStep.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly ArtStepDbContext _context;

        public DashboardController(ArtStepDbContext context)
        {
            _context = context;
        }

        // Endpoint cho các thẻ thông số
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var thirtyDaysAgo = DateTime.Now.AddDays(-30);
            var monthlyEarnings = await _context.OrderDetail
                .Where(od => od.Order != null && od.Order.CreateAt >= thirtyDaysAgo && od.Order.Status == "Completed")
                .SumAsync(od => od.CostaShoe ?? 0);

            var sevenDaysAgo = DateTime.Now.AddDays(-7);
            var weeklyOrders = await _context.Order
                .Where(o => o.CreateAt >= sevenDaysAgo)
                .CountAsync();

            return Ok(new
            {
                monthlyEarnings,
                weeklyOrders
            });
        }

        // Endpoint cho biểu đồ doanh thu theo tháng
        [HttpGet("monthly-revenue")]
        public async Task<IActionResult> GetMonthlyRevenue()
        {
            var last12Months = Enumerable.Range(0, 12)
                .Select(i => DateTime.Now.AddMonths(-i))
                .OrderBy(d => d);

            var revenueData = await _context.OrderDetail
                .Where(od => od.Order != null && od.Order.Status == "Completed" && od.Order.CreateAt >= last12Months.First())
                .GroupBy(od => new { od.Order.CreateAt.Year, od.Order.CreateAt.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Total = g.Sum(od => od.CostaShoe ?? 0)
                })
                .ToListAsync();

            var result = last12Months.Select(m => new {
                label = $"Thg {m.Month}/{m.Year}",
                data = revenueData.FirstOrDefault(r => r.Year == m.Year && r.Month == m.Month)?.Total ?? 0
            }).ToList();

            return Ok(new
            {
                labels = result.Select(r => r.label),
                data = result.Select(r => r.data)
            });
        }
    }
}
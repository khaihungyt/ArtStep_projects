using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ArtStep.Data;
using System.Security.Claims;

namespace ArtStep.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly ArtStepDbContext _context;

        public OrderController(ArtStepDbContext context)
        {
            _context = context;
        }

        [HttpPost("checkout")]
        public async Task<ActionResult> Checkout()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User not authenticated" });

                // Get user's cart with items
                var cart = await _context.Carts
                    .Include(c => c.CartDetails)
                    .ThenInclude(cd => cd.ShoeCustom)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null || cart.CartDetails == null || !cart.CartDetails.Any())
                {
                    return BadRequest(new { message = "Cart is empty" });
                }

                // Create new order
                var orderId = Guid.NewGuid().ToString();
                var order = new Order
                {
                    OrderId = orderId,
                    UserId = userId,
                    Status = "Pending",
                    CreateAt = DateTime.Now
                };

                _context.Order.Add(order);

                // Create order details from cart items
                var orderDetails = new List<OrderDetail>();
                foreach (var cartItem in cart.CartDetails)
                {
                    if (cartItem.ShoeCustom != null)
                    {
                        var orderDetail = new OrderDetail
                        {
                            OrderDetailId = Guid.NewGuid().ToString(),
                            OrderId = orderId,
                            ShoeCustomId = cartItem.ShoeCustomId,
                            QuantityBuy = cartItem.QuantityBuy,
                            CostaShoe = cartItem.ShoeCustom.PriceAShoe * cartItem.QuantityBuy
                        };
                        orderDetails.Add(orderDetail);
                    }
                }

                _context.OrderDetail.AddRange(orderDetails);

                // Handle foreign key constraint: Set CartDetailId to NULL in messages before deleting cart details
                var cartDetailIds = cart.CartDetails.Select(cd => cd.CartDetailID).ToList();
                //var messagesWithCartDetails = await _context.Message
                //    .Where(m => cartDetailIds.Contains(m.CartDetailId))
                //    .ToListAsync();

                //foreach (var message in messagesWithCartDetails)
                //{
                //    message.CartDetailId = null;
                //}

                // Clear the cart after successful order creation
                _context.CartsDetail.RemoveRange(cart.CartDetails);
                _context.Carts.Remove(cart);

                // Save all changes
                await _context.SaveChangesAsync();

                // Calculate total for response
                var totalAmount = orderDetails.Sum(od => od.CostaShoe ?? 0);

                return Ok(new
                {
                    message = "Order placed successfully!",
                    orderId = orderId,
                    totalAmount = totalAmount,
                    itemCount = orderDetails.Count,
                    status = "Pending"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during checkout", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult> GetOrders()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User not authenticated" });

                var orders = await _context.Order
                    .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ShoeCustom)
                    .ThenInclude(sc => sc.Images)
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.CreateAt)
                    .Select(o => new
                    {
                        orderId = o.OrderId,
                        status = o.Status,
                        createAt = o.CreateAt,
                        totalAmount = o.OrderDetails.Sum(od => od.CostaShoe ?? 0),
                        itemCount = o.OrderDetails.Count(),
                        orderDetails = o.OrderDetails.Select(od => new
                        {
                            orderDetailId = od.OrderDetailId,
                            shoeCustomId = od.ShoeCustomId,
                            quantityBuy = od.QuantityBuy,
                            costaShoe = od.CostaShoe,
                            shoeCustom = od.ShoeCustom != null ? new
                            {
                                shoeId = od.ShoeCustom.ShoeId,
                                shoeName = od.ShoeCustom.ShoeName,
                                shoeDescription = od.ShoeCustom.ShoeDescription,
                                priceAShoe = od.ShoeCustom.PriceAShoe,
                                images = od.ShoeCustom.Images != null ? od.ShoeCustom.Images.Select(img => new
                                {
                                    imageLink = img.ImageLink
                                }).ToArray() : new object[0]
                            } : null
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(new { orders });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving orders", error = ex.Message });
            }
        }
    }
}
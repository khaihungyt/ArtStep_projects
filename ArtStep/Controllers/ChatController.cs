using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ArtStep.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using ArtStep.Hubs;

namespace ArtStep.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ArtStepDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(ArtStepDbContext context, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpPost("send")]
        public async Task<ActionResult> SendMessage([FromBody] SendMessageDto messageDto)
        {
            try
            {
                var senderId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(senderId))
                    return Unauthorized(new { message = "User not authenticated" });

                // Create message record
                var message = new Message
                {
                    MessageId = Guid.NewGuid().ToString(),
                    MessageDescription = messageDto.MessageText,
                    MessageType = true, // true for sent, false for received
                    SenderId = senderId,
                    ReceivedId = messageDto.ReceiverId,
                    SendAt = DateTime.Now
                };

                _context.Message.Add(message);
                await _context.SaveChangesAsync();

                // Get sender info for real-time notification
                var sender = await _context.User.FindAsync(senderId);

                // Send real-time notification via SignalR
                await _hubContext.Clients.Group($"User_{messageDto.ReceiverId}")
                    .SendAsync("ReceiveMessage", new
                    {
                        messageId = message.MessageId,
                        senderId = senderId,
                        senderName = sender?.Name ?? "Unknown",
                        message = messageDto.MessageText,
                        timestamp = message.SendAt
                    });

                return Ok(new
                {
                    message = "Message sent successfully",
                    messageId = message.MessageId,
                    timestamp = message.SendAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while sending the message" });
            }
        }

        [HttpGet("history/{designerId}")]
        public async Task<ActionResult> GetChatHistory(string designerId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User not authenticated" });

                var messages = await _context.Message
                    .Include(m => m.UserSend)
                    .Include(m => m.UserReceived)
                    .Where(m => (m.SenderId == userId && m.ReceivedId == designerId) ||
                               (m.SenderId == designerId && m.ReceivedId == userId))
                    .OrderBy(m => m.SendAt)
                    .Select(m => new
                    {
                        messageId = m.MessageId,
                        messageText = m.MessageDescription,
                        senderId = m.SenderId,
                        senderName = m.UserSend != null ? m.UserSend.Name : "Unknown",
                        receiverId = m.ReceivedId,
                        receiverName = m.UserReceived != null ? m.UserReceived.Name : "Unknown",
                        sendAt = m.SendAt,
                        isFromCurrentUser = m.SenderId == userId
                    })
                    .ToListAsync();

                return Ok(new { messages });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving chat history" });
            }
        }

        [HttpGet("conversations")]
        public async Task<ActionResult> GetConversations()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User not authenticated" });

                // Get all unique conversations for the current user
                var conversations = await _context.Message
                    .Include(m => m.UserSend)
                    .Include(m => m.UserReceived)
                    .Where(m => m.SenderId == userId || m.ReceivedId == userId)
                    .GroupBy(m => m.SenderId == userId ? m.ReceivedId : m.SenderId)
                    .Select(g => new
                    {
                        partnerId = g.Key,
                        partnerName = g.FirstOrDefault(m => m.SenderId == userId) != null 
                            ? g.FirstOrDefault(m => m.SenderId == userId).UserReceived.Name
                            : g.FirstOrDefault(m => m.ReceivedId == userId).UserSend.Name,
                        lastMessage = g.OrderByDescending(m => m.SendAt).FirstOrDefault().MessageDescription,
                        lastMessageTime = g.OrderByDescending(m => m.SendAt).FirstOrDefault().SendAt,
                        unreadCount = g.Count(m => m.ReceivedId == userId && m.MessageType == true) // Simplified unread logic
                    })
                    .OrderByDescending(c => c.lastMessageTime)
                    .ToListAsync();

                return Ok(new { conversations });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving conversations" });
            }
        }

        [HttpGet("designers")]
        public async Task<ActionResult> GetDesigners()
        {
            try
            {
                var designers = await _context.User
                    .Where(u => u.Role == "Designer")
                    .Select(d => new
                    {
                        userId = d.UserId,
                        name = d.Name,
                        email = d.Email,
                        imageProfile = d.ImageProfile
                    })
                    .ToListAsync();

                return Ok(new { designers });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving designers" });
            }
        }
    }

    public class SendMessageDto
    {
        public string ReceiverId { get; set; } = string.Empty;
        public string MessageText { get; set; } = string.Empty;
    }
} 
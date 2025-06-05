using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ArtStep.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public async Task JoinUserGroup(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        public async Task LeaveUserGroup(string userId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        public async Task SendMessage(string receiverId, string message, string shoeCustomId = null)
        {
            var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var senderName = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(senderId))
                return;

            // Send message to the receiver's group
            await Clients.Group($"User_{receiverId}").SendAsync("ReceiveMessage", new
            {
                senderId = senderId,
                senderName = senderName,
                message = message,
                timestamp = DateTime.Now,
                shoeCustomId = shoeCustomId
            });

            // Send confirmation back to sender
            await Clients.Caller.SendAsync("MessageSent", new
            {
                receiverId = receiverId,
                message = message,
                timestamp = DateTime.Now,
                shoeCustomId = shoeCustomId
            });
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
} 
class ChatSystem {
    constructor() {
        this.connection = null;
        this.currentUserId = localStorage.getItem('userId');
        this.currentUserName = localStorage.getItem('username');
        this.currentUserRole = localStorage.getItem('role');
        this.token = localStorage.getItem('token');
        this.currentDesignerId = null;
        this.currentShoeCustomId = null;
        this.isConnected = false;
        
        // Only initialize chat for users with 'User' role
        if (this.currentUserRole && this.currentUserRole.toLowerCase() === 'user') {
            this.initializeSignalR();
            this.createChatUI();
            this.bindEvents();
            this.startTimestampUpdater();
        }
    }

    async initializeSignalR() {
        if (!this.token) {
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/chatHub", {
                accessTokenFactory: () => this.token,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        this.connection.on("ReceiveMessage", (data) => {
            this.handleIncomingMessage(data);
        });

        this.connection.on("MessageSent", (data) => {
            this.handleMessageSent(data);
        });

        this.connection.onreconnecting((error) => {
            // Connection reconnecting
        });

        this.connection.onreconnected((connectionId) => {
            // Rejoin user group after reconnection
            if (this.currentUserId) {
                this.connection.invoke("JoinUserGroup", this.currentUserId);
            }
        });

        this.connection.onclose((error) => {
            this.isConnected = false;
        });

        try {
            await this.connection.start();
            this.isConnected = true;
            
            // Join user group
            if (this.currentUserId) {
                await this.connection.invoke("JoinUserGroup", this.currentUserId);
            }
        } catch (err) {
            this.isConnected = false;
        }
    }

    createChatUI() {
        // Create chat button (bottom right)
        const chatButton = document.createElement('div');
        chatButton.id = 'chat-button';
        chatButton.className = 'chat-button';
        chatButton.innerHTML = `
            <i class="bi bi-chat-dots"></i>
            <span class="chat-badge" id="chat-badge" style="display: none;">0</span>
        `;

        // Create chat popup
        const chatPopup = document.createElement('div');
        chatPopup.id = 'chat-popup';
        chatPopup.className = 'chat-popup';

        chatPopup.innerHTML = `
            <div class="chat-header">
                <h6 class="mb-0" id="chat-title">Chats</h6>
                <button class="btn btn-sm text-white" id="close-chat">×</button>
            </div>
            <div class="chat-content">
                <!-- Conversations List -->
                <div id="conversations-view" class="conversations-view">
                    <div class="p-3">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="mb-0">Conversations</h6>
                        </div>
                        <div id="conversations-list" class="conversations-list">
                            <!-- Conversations will be loaded here -->
                        </div>
                    </div>
                </div>
                
                <!-- Chat View -->
                <div id="chat-view" class="chat-view">
                    <div class="chat-header-back">
                        <button class="btn btn-sm btn-outline-secondary me-2" id="back-to-conversations-from-chat">
                            <i class="bi bi-arrow-left"></i> Back
                        </button>
                        <span id="chat-partner-name"></span>
                    </div>
                    <div class="chat-messages" id="chat-messages">
                        <!-- Messages will appear here -->
                    </div>
                    <div class="chat-input">
                        <div class="input-group">
                            <input type="text" class="form-control" id="message-input" placeholder="Type a message...">
                            <button class="btn btn-primary" id="send-message">
                                <i class="bi bi-send"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Designer Selection -->
                <div id="designer-selection" class="designer-selection">
                    <div class="p-3">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="mb-0">Select Designer</h6>
                            <button class="btn btn-sm btn-secondary" id="back-to-conversations">Back</button>
                        </div>
                        <div id="designers-list" class="designers-list">
                            <!-- Designers will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(chatButton);
        document.body.appendChild(chatPopup);
    }

    bindEvents() {
        // Chat button click
        document.getElementById('chat-button').addEventListener('click', () => {
            this.toggleChatPopup();
        });

        // Close chat
        document.getElementById('close-chat').addEventListener('click', () => {
            this.hideChatPopup();
        });

        // Back to conversations from chat view
        document.getElementById('back-to-conversations-from-chat').addEventListener('click', () => {
            this.showConversations();
        });

        // Back to conversations from designer selection
        document.getElementById('back-to-conversations').addEventListener('click', () => {
            this.showConversations();
        });

        // Send message
        document.getElementById('send-message').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send message
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChatPopup() {
        const popup = document.getElementById('chat-popup');
        if (popup.style.display === 'none' || popup.style.display === '') {
            this.showChatPopup();
        } else {
            this.hideChatPopup();
        }
    }

    showChatPopup() {
        if (!this.token) {
            this.showToast('Please login to use chat', 'error');
            return;
        }

        const popup = document.getElementById('chat-popup');
        if (popup) {
            popup.style.display = 'flex';
        }
        this.showConversations();
        this.loadConversations();
    }

    hideChatPopup() {
        document.getElementById('chat-popup').style.display = 'none';
    }

    showConversations() {
        document.getElementById('conversations-view').style.display = 'block';
        document.getElementById('chat-view').style.display = 'none';
        document.getElementById('designer-selection').style.display = 'none';
        document.getElementById('chat-title').textContent = 'Chats';
        
        // Reload conversations to get updated timestamps and messages
        this.loadConversations();
    }

    showChatView(designerName) {
        document.getElementById('conversations-view').style.display = 'none';
        document.getElementById('chat-view').style.display = 'flex';
        document.getElementById('designer-selection').style.display = 'none';
        document.getElementById('chat-title').textContent = designerName;
        
        // Set the partner name in the back button header
        const partnerNameElement = document.getElementById('chat-partner-name');
        if (partnerNameElement) {
            partnerNameElement.textContent = designerName;
        }
    }

    showDesignerSelection() {
        document.getElementById('conversations-view').style.display = 'none';
        document.getElementById('chat-view').style.display = 'none';
        document.getElementById('designer-selection').style.display = 'block';
        document.getElementById('chat-title').textContent = 'New Chat';
        this.loadDesigners();
    }

    async loadConversations() {
        try {
            const response = await fetch('http://localhost:5155/api/Chat/conversations', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Handle clean JSON response format
                if (data && data.conversations) {
                    this.displayConversations(data.conversations);
                } else {
                    this.displayConversations([]);
                }
            } else {
                this.displayConversations([]);
                this.showToast('Failed to load conversations', 'error');
            }
        } catch (error) {
            this.displayConversations([]);
            this.showToast('Error loading conversations', 'error');
        }
    }

    displayConversations(conversations) {
        const container = document.getElementById('conversations-list');
        
        if (!conversations || !Array.isArray(conversations) || conversations.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No conversations yet</p>';
            return;
        }

        container.innerHTML = conversations.filter(conv => conv && conv.partnerId && conv.partnerName).map(conv => `
            <div class="conversation-item" onclick="chatSystem.openConversation('${conv.partnerId}', '${conv.partnerName}')">
                <div class="d-flex justify-content-between">
                    <strong>${conv.partnerName || 'Unknown'}</strong>
                    <small class="text-muted conversation-time" data-timestamp="${conv.lastMessageTime}">${this.formatTime(conv.lastMessageTime)}</small>
                </div>
                <div class="text-muted small">${conv.lastMessage || 'No messages'}</div>
                ${conv.unreadCount > 0 ? `<span class="badge bg-primary">${conv.unreadCount}</span>` : ''}
            </div>
        `).join('');
    }

    async loadDesigners() {
        try {
            const response = await fetch('http://localhost:5155/api/Chat/designers', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Handle clean JSON response format
                if (data && data.designers) {
                    this.displayDesigners(data.designers);
                } else {
                    this.displayDesigners([]);
                }
            } else {
                this.displayDesigners([]);
                this.showToast('Failed to load designers', 'error');
            }
        } catch (error) {
            this.displayDesigners([]);
            this.showToast('Error loading designers', 'error');
        }
    }

    displayDesigners(designers) {
        const container = document.getElementById('designers-list');
        
        if (!designers || !Array.isArray(designers) || designers.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No designers available</p>';
            return;
        }

        container.innerHTML = designers.filter(designer => designer && designer.userId && designer.name).map(designer => `
            <div class="designer-item" onclick="chatSystem.startNewChat('${designer.userId}', '${designer.name}')">
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <img src="${designer.imageProfile || '/images/default-avatar.png'}" 
                             alt="${designer.name || 'Designer'}">
                    </div>
                    <div>
                        <strong>${designer.name || 'Unknown Designer'}</strong>
                        <div class="text-muted small">${designer.email || ''}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    startNewChat(designerId, designerName) {
        this.currentDesignerId = designerId;
        this.showChatView(designerName);
        this.loadChatHistory(designerId);
    }

    openConversation(designerId, designerName) {
        this.currentDesignerId = designerId;
        this.currentShoeCustomId = null; // Reset shoe context when opening from conversations
        this.showChatView(designerName);
        this.loadChatHistory(designerId);
    }

    async loadChatHistory(designerId, shoeCustomId = null) {
        try {
            let url = `http://localhost:5155/api/Chat/history/${designerId}`;
            if (shoeCustomId) {
                url += `?shoeCustomId=${shoeCustomId}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Handle clean JSON response format
                if (data && data.messages) {
                    this.displayMessages(data.messages);
                } else {
                    this.displayMessages([]);
                }
            } else {
                this.displayMessages([]);
                this.showToast('Failed to load chat history', 'error');
            }
        } catch (error) {
            this.displayMessages([]);
            this.showToast('Error loading chat history', 'error');
        }
    }

    displayMessages(messages) {
        const container = document.getElementById('chat-messages');
        
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No messages yet. Start the conversation!</p>';
            return;
        }

        container.innerHTML = messages.filter(msg => msg && msg.messageText).map(msg => `
            <div class="message ${msg.isFromCurrentUser ? 'sent' : 'received'}">
                <div class="message-bubble">
                    <div>${msg.messageText || ''}</div>
                    <small>${this.formatTime(msg.sendAt)}</small>
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    async sendMessage() {
        const input = document.getElementById('message-input');
        const messageText = input.value.trim();

        if (!messageText || !this.currentDesignerId) return;

        try {
            const response = await fetch('http://localhost:5155/api/Chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    receiverId: this.currentDesignerId,
                    messageText: messageText,
                    shoeCustomId: this.currentShoeCustomId
                })
            });

            if (response.ok) {
                input.value = '';
                // Add message to UI immediately
                this.addMessageToUI(messageText, true);
                
                // Update conversations list in background to reflect latest message
                this.loadConversations();
            } else {
                this.showToast('Failed to send message', 'error');
            }
        } catch (error) {
            this.showToast('Error sending message', 'error');
        }
    }

    addMessageToUI(messageText, isFromCurrentUser) {
        const container = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isFromCurrentUser ? 'sent' : 'received'}`;
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div>${messageText}</div>
                <small>Just now</small>
            </div>
        `;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    handleIncomingMessage(data) {
        // Update chat badge
        this.updateChatBadge();
        
        // If chat is open and it's from current conversation, refresh the chat history
        if (this.currentDesignerId === data.senderId) {
            // Reload chat history to get the complete message with proper formatting
            this.loadChatHistory(this.currentDesignerId, this.currentShoeCustomId);
        }
        
        // Update conversations list to reflect new message
        this.loadConversations();
        
        // Show notification
        this.showToast(`New message from ${data.senderName}`, 'info');
    }

    handleMessageSent(data) {
        // Message sent confirmation
    }

    updateChatBadge() {
        const badge = document.getElementById('chat-badge');
        let count = parseInt(badge.textContent) || 0;
        count++;
        badge.textContent = count;
        badge.style.display = 'block';
    }

    formatTime(dateString) {
        if (!dateString) return 'Unknown time';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const now = new Date();
        const diff = now - date;
        
        // More precise time formatting
        if (diff < 30000) return 'Just now'; // Less than 30 seconds
        if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`; // Less than 1 minute
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`; // Less than 1 hour
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`; // Less than 1 day
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`; // Less than 1 week
        
        // For older messages, show actual date
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }

    showToast(message, type = 'info') {
        // Create toast if it doesn't exist
        let toast = document.getElementById('chat-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'chat-toast';
            toast.className = `chat-toast ${type}`;
            document.body.appendChild(toast);
        }

        toast.className = `chat-toast ${type}`;
        toast.textContent = message;
        toast.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Method to start chat with specific designer and shoe
    startChatWithDesigner(designerId, designerName, shoeCustomId = null) {
        if (!designerId) {
            this.showToast('Designer information is missing', 'error');
            return;
        }

        // Ensure chat UI exists
        if (!document.getElementById('chat-popup')) {
            this.createChatUI();
            this.bindEvents();
        }

        this.currentDesignerId = designerId;
        this.currentShoeCustomId = shoeCustomId;
        
        // Force show popup and chat view directly
        const popup = document.getElementById('chat-popup');
        if (popup) {
            popup.style.setProperty('display', 'flex', 'important');
            popup.style.setProperty('visibility', 'visible', 'important');
            popup.style.setProperty('opacity', '1', 'important');
        }
        
        // Show chat view directly without going through conversations
        this.showChatViewDirect(designerName || 'Designer');
        this.loadChatHistory(designerId, shoeCustomId);
    }

    showChatViewDirect(designerName) {
        // Ensure popup is visible
        const popup = document.getElementById('chat-popup');
        if (popup) {
            popup.style.display = 'flex';
        }
        
        // Hide other views and show chat view
        const conversationsView = document.getElementById('conversations-view');
        const chatView = document.getElementById('chat-view');
        const designerSelection = document.getElementById('designer-selection');
        const chatTitle = document.getElementById('chat-title');
        
        if (conversationsView) conversationsView.style.display = 'none';
        if (chatView) chatView.style.display = 'flex';
        if (designerSelection) designerSelection.style.display = 'none';
        if (chatTitle) chatTitle.textContent = designerName;
    }

    startTimestampUpdater() {
        // Update timestamps every 30 seconds
        setInterval(() => {
            // Only update if conversations view is visible and we have conversations
            const conversationsView = document.getElementById('conversations-view');
            const conversationsList = document.getElementById('conversations-list');
            
            if (conversationsView && 
                conversationsView.style.display !== 'none' && 
                conversationsList && 
                conversationsList.children.length > 0) {
                
                // Update timestamps in existing conversation items
                const timeElements = conversationsList.querySelectorAll('.conversation-time');
                timeElements.forEach(timeElement => {
                    const timestamp = timeElement.getAttribute('data-timestamp');
                    if (timestamp) {
                        timeElement.textContent = this.formatTime(timestamp);
                    }
                });
            }
        }, 30000); // Update every 30 seconds
    }
}

// Initialize chat system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is logged in
    if (localStorage.getItem('token')) {
        window.chatSystem = new ChatSystem();
    }
});

// Make ChatSystem available globally
window.ChatSystem = ChatSystem;

// Global function to start chat from product pages
window.startChatWithDesigner = function(designerId, designerName, shoeCustomId = null) {
    if (!window.chatSystem) {
        if (!localStorage.getItem('token')) {
            alert('Please login to chat with designers');
            return;
        }
        window.chatSystem = new ChatSystem();
    }
    window.chatSystem.startChatWithDesigner(designerId, designerName, shoeCustomId);
}; 
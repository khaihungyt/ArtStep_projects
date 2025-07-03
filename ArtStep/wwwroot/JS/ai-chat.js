// Import marked from CDN
const markedScript = document.createElement('script');
markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
document.head.appendChild(markedScript);

// Singleton instance
let instance = null;

export class AIChatSystem {
    constructor() {
        // Singleton pattern
        if (instance) {
            return instance;
        }
        instance = this;

        this.isAuthenticated = false;
        this.chatHistory = [];
        this.initialized = false;

        // Wait for marked to load
        markedScript.onload = () => {
            this.init();
            // Load chat history after UI is initialized
            this.loadChatHistory();
            // Check auth status after loading history
            this.checkAuthStatus();
        };

        // Store instance in sessionStorage to persist across page navigation
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('aiChatInitialized', 'true');
        }
    }

    static getInstance() {
        if (!instance) {
            instance = new AIChatSystem();
        }
        return instance;
    }

    // Lấy key lưu trữ dựa trên userId
    getStorageKey() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        try {
            // Decode JWT token để lấy userId
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            return `aiChatHistory_${payload.userId || payload.sub || payload.id}`;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Kiểm tra và giới hạn dung lượng lưu trữ
    checkStorageLimit(history) {
        const MAX_STORAGE_SIZE = 4.5 * 1024 * 1024; // 4.5MB để dư buffer
        let currentSize = new Blob([JSON.stringify(history)]).size;
        
        while (currentSize > MAX_STORAGE_SIZE && history.length > 0) {
            // Xóa 10 tin nhắn cũ nhất mỗi lần
            history.splice(0, 10);
            currentSize = new Blob([JSON.stringify(history)]).size;
        }
        
        return history;
    }

    // Lưu tin nhắn vào localStorage
    saveChatHistory() {
        const storageKey = this.getStorageKey();
        if (!storageKey) return;

        try {
            // Giới hạn dung lượng trước khi lưu
            const limitedHistory = this.checkStorageLimit([...this.chatHistory]);
            
            if (limitedHistory.length < this.chatHistory.length) {
                // Nếu có tin nhắn bị xóa, cập nhật lại chatHistory và giao diện
                this.chatHistory = limitedHistory;
                const messagesContainer = document.querySelector('.ai-chat-messages');
                messagesContainer.innerHTML = '';
                this.chatHistory.forEach(msg => {
                    this.addMessage(msg.text, msg.type, msg.isHtml, false);
                });
                this.addMessage('Một số tin nhắn cũ đã bị xóa do vượt quá giới hạn lưu trữ.', 'ai', false, false);
            }

            localStorage.setItem(storageKey, JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
            this.addMessage('Không thể lưu tin nhắn do vượt quá giới hạn lưu trữ.', 'ai', false, false);
        }
    }

    // Tải lịch sử chat từ localStorage
    loadChatHistory() {
        if (!this.initialized) {
            console.warn('Attempting to load chat history before initialization');
            return;
        }

        const storageKey = this.getStorageKey();
        if (!storageKey) return;

        try {
            const savedHistory = localStorage.getItem(storageKey);
            if (savedHistory) {
                this.chatHistory = JSON.parse(savedHistory);
                // Hiển thị lại các tin nhắn từ lịch sử
                const messagesContainer = document.querySelector('.ai-chat-messages');
                if (messagesContainer) {
                    messagesContainer.innerHTML = ''; // Xóa tin nhắn chào mừng mặc định
                    this.chatHistory.forEach(msg => {
                        this.addMessage(msg.text, msg.type, msg.isHtml, false);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    // Xóa lịch sử chat
    clearChatHistory() {
        this.chatHistory = [];
        const storageKey = this.getStorageKey();
        if (storageKey) {
            localStorage.removeItem(storageKey);
        }
        const messagesContainer = document.querySelector('.ai-chat-messages');
        messagesContainer.innerHTML = '';
        this.addMessage('Xin chào! Tôi có thể giúp gì cho bạn hôm nay?', 'ai');
    }

    init() {
        // Check if chat UI already exists
        if (document.querySelector('.ai-chat-button')) {
            return;
        }

        // Create and append chat button
        const chatButton = document.createElement('div');
        chatButton.className = 'ai-chat-button';
        chatButton.innerHTML = '<i class="bi bi-robot"></i>';
        document.body.appendChild(chatButton);

        // Create and append chat popup
        const chatPopup = document.createElement('div');
        chatPopup.className = 'ai-chat-popup';
        chatPopup.innerHTML = `
            <div class="ai-chat-header">
                <h6><i class="bi bi-robot"></i> Trợ lý AI</h6>
                <div class="ai-chat-actions">
                    <button class="ai-chat-clear" title="Xóa lịch sử">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="ai-chat-close">&times;</button>
                </div>
            </div>
            <div class="ai-chat-messages"></div>
            <div class="ai-chat-input">
                <div class="ai-input-container">
                    <div class="ai-input-box" 
                         contenteditable="true" 
                         placeholder="Nhập tin nhắn của bạn..."></div>
                    <button class="ai-send-button">
                        <i class="bi bi-send"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(chatPopup);

        // Event listeners
        chatButton.addEventListener('click', () => this.toggleChat());
        chatPopup.querySelector('.ai-chat-close').addEventListener('click', () => this.toggleChat());
        chatPopup.querySelector('.ai-chat-clear').addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat?')) {
                this.clearChatHistory();
            }
        });
        
        const inputBox = chatPopup.querySelector('.ai-input-box');
        const sendButton = chatPopup.querySelector('.ai-send-button');

        inputBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendButton.addEventListener('click', () => this.sendMessage());

        this.initialized = true;
    }

    async checkAuthStatus() {
        if (!this.initialized) {
            console.warn('Attempting to check auth status before initialization');
            return;
        }

        const token = localStorage.getItem('token');
        this.isAuthenticated = !!token;
        
        if (!this.isAuthenticated) {
            this.addMessage('Vui lòng đăng nhập để sử dụng tính năng trò chuyện với AI.', 'ai', false, false);
            this.disableInput();
        } else if (this.chatHistory.length === 0) {
            // Only add welcome message if there's no chat history
            this.addMessage('Xin chào! Tôi có thể giúp gì cho bạn hôm nay?', 'ai', false, false);
        }
    }

    toggleChat() {
        const popup = document.querySelector('.ai-chat-popup');
        const button = document.querySelector('.ai-chat-button');
        popup.classList.toggle('active');
        button.classList.toggle('active');

        // If chat is being opened (has active class), scroll to last message
        if (popup.classList.contains('active')) {
            const messagesContainer = document.querySelector('.ai-chat-messages');
            if (messagesContainer) {
                // Use setTimeout to ensure the scroll happens after the chat becomes visible
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 100);
            }
        }
    }

    disableInput() {
        const inputBox = document.querySelector('.ai-input-box');
        const sendButton = document.querySelector('.ai-send-button');
        inputBox.setAttribute('contenteditable', 'false');
        inputBox.style.opacity = '0.5';
        sendButton.disabled = true;
    }

    enableInput() {
        const inputBox = document.querySelector('.ai-input-box');
        const sendButton = document.querySelector('.ai-send-button');
        inputBox.setAttribute('contenteditable', 'true');
        inputBox.style.opacity = '1';
        sendButton.disabled = false;
    }

    addMessage(text, type = 'user', isHtml = false, shouldSave = true) {
        const messagesContainer = document.querySelector('.ai-chat-messages');
        if (!messagesContainer) return; // Don't add message if container doesn't exist yet
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${type}`;
        
        const content = isHtml ? text : this.escapeHtml(text);
        
        messageDiv.innerHTML = `
            <div class="ai-avatar">
                ${type === 'ai' ? '<i class="bi bi-robot"></i>' : '<i class="bi bi-person"></i>'}
            </div>
            <div class="ai-message-bubble">${content}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add to history array
        if (shouldSave) {
            this.chatHistory.push({ text, type, isHtml });
            this.saveChatHistory();
        }
    }

    showTyping() {
        const messagesContainer = document.querySelector('.ai-chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message ai';
        typingDiv.innerHTML = `
            <div class="ai-avatar">
                <i class="bi bi-robot"></i>
            </div>
            <div class="ai-message-bubble">
                <div class="ai-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return typingDiv;
    }

    async sendMessage() {
        if (!this.isAuthenticated) {
            this.addMessage('Please log in to use the AI chat feature.', 'ai');
            return;
        }

        const inputBox = document.querySelector('.ai-input-box');
        const text = inputBox.textContent.trim();
        
        if (!text) return;

        // Clear input
        inputBox.textContent = '';
        
        // Add user message
        this.addMessage(text, 'user');

        // Disable input while processing
        this.disableInput();
        
        // Show typing indicator
        const typingIndicator = this.showTyping();

        try {
            const response = await fetch('/api/AIchat/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    prompt: text
                })
            });

            // Remove typing indicator
            typingIndicator.remove();

            if (response.ok) {
                const data = await response.json();
                console.log('AI Response:', data); // Debug log
                
                // Check if data exists and has the required properties
                if (data && typeof data === 'object') {
                    if (data.Success === true && data.GeneratedText) {
                        // Parse markdown and sanitize HTML
                        const parsedText = marked.parse(data.GeneratedText.trim(), {
                            breaks: true,
                            gfm: true
                        });
                        this.addMessage(parsedText, 'ai', true);
                    } else if (data.Success === false && data.ErrorMessage) {
                        this.addMessage('Xin lỗi, tôi gặp lỗi: ' + data.ErrorMessage, 'ai');
                    } else {
                        this.addMessage('Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.', 'ai');
                    }
                } else {
                    this.addMessage('Xin lỗi, có lỗi xảy ra khi xử lý phản hồi.', 'ai');
                }
            } else {
                if (response.status === 401) {
                    this.isAuthenticated = false;
                    this.addMessage('Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.', 'ai');
                } else {
                    this.addMessage('Xin lỗi, tôi gặp lỗi. Vui lòng thử lại sau.', 'ai');
                }
            }
        } catch (error) {
            typingIndicator.remove();
            this.addMessage('Xin lỗi, tôi gặp lỗi. Vui lòng thử lại sau.', 'ai');
            console.error('Error:', error);
        }

        // Re-enable input
        this.enableInput();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize AI Chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIChatSystem();
}); 
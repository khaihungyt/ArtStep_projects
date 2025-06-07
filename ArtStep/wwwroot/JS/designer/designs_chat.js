document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const conversations = document.querySelectorAll('.conversation');
    const messagesContainer = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input textarea');
    const sendBtn = document.querySelector('.send-btn');
    const uploadBtn = document.querySelector('.upload-btn');
    const fileUpload = document.getElementById('file-upload');

    // Biến lưu trữ tạm
    let currentConversation = null;
    const messageHistory = {};

    // Khởi tạo lịch sử chat mẫu
    initializeSampleData();

    // Xử lý chọn hội thoại
    conversations.forEach(conv => {
        conv.addEventListener('click', function () {
            const conversationId = this.dataset.conversationId;
            selectConversation(conversationId);
        });
    });

    // Chọn hội thoại đầu tiên khi tải trang
    if (conversations.length > 0) {
        const firstConversation = conversations[0];
        const conversationId = firstConversation.dataset.conversationId;
        selectConversation(conversationId);
    }

    // Gửi tin nhắn
    sendBtn.addEventListener('click', function (e) {
        e.preventDefault(); // Ngăn form submit nếu có
        sendMessage();
    });

    // Gửi bằng phím Enter
    chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Tự động điều chỉnh chiều cao textarea
    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Upload ảnh
    uploadBtn.addEventListener('click', function () {
        fileUpload.click();
    });

    fileUpload.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            uploadImage(e.target.files[0]);
        }
    });

    // Hàm chọn hội thoại
    function selectConversation(conversationId) {
        // Cập nhật UI
        conversations.forEach(c => c.classList.remove('active'));
        document.querySelector(`.conversation[data-conversation-id="${conversationId}"]`).classList.add('active');

        // Lưu hội thoại hiện tại
        currentConversation = conversationId;

        // Hiển thị tin nhắn
        displayMessages(conversationId);
    }

    // Hàm hiển thị tin nhắn
    function displayMessages(conversationId) {
        messagesContainer.innerHTML = '';

        if (messageHistory[conversationId]) {
            messageHistory[conversationId].forEach(msg => {
                addMessageToUI(msg, false);
            });
        }

        scrollToBottom();
    }

    // Hàm gửi tin nhắn
    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText || !currentConversation) return;

        const newMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'me',
            timestamp: new Date(),
            type: 'text'
        };

        // Lưu vào lịch sử
        if (!messageHistory[currentConversation]) {
            messageHistory[currentConversation] = [];
        }
        messageHistory[currentConversation].push(newMessage);

        // Hiển thị lên UI
        addMessageToUI(newMessage);

        // Xóa nội dung input
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Cuộn xuống dưới cùng
        scrollToBottom();

        // Giả lập phản hồi sau 1-2 giây
        setTimeout(simulateReply, 1000 + Math.random() * 1000);
    }

    // Hàm upload ảnh
    function uploadImage(file) {
        if (!file.type.match('image.*')) {
            alert('Vui lòng chọn file ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước ảnh tối đa là 5MB');
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const newMessage = {
                id: Date.now(),
                imageUrl: e.target.result,
                sender: 'me',
                timestamp: new Date(),
                type: 'image'
            };

            // Lưu vào lịch sử
            if (!messageHistory[currentConversation]) {
                messageHistory[currentConversation] = [];
            }
            messageHistory[currentConversation].push(newMessage);

            // Hiển thị lên UI
            addMessageToUI(newMessage);

            // Cuộn xuống dưới cùng
            scrollToBottom();

            // Reset input file
            fileUpload.value = '';

            // Giả lập phản hồi sau 1-2 giây
            setTimeout(simulateImageReply, 1000 + Math.random() * 1000);
        };

        reader.readAsDataURL(file);
    }

    // Hàm thêm tin nhắn vào UI
    function addMessageToUI(message, shouldScroll = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'me' ? 'sent' : 'received'}`;

        if (message.sender !== 'me') {
            const avatar = getAvatarForConversation(currentConversation);
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="${avatar}" alt="Avatar">
                </div>
            `;
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (message.type === 'text') {
            contentDiv.innerHTML = `
                <div class="message-text">${message.text}</div>
            `;
        } else if (message.type === 'image') {
            contentDiv.innerHTML = `
                <div class="message-image">
                    <img src="${message.imageUrl}" alt="Hình ảnh">
                </div>
            `;
        }

        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);

        if (shouldScroll) {
            scrollToBottom();
        }
    }

    // Hàm giả lập phản hồi
    function simulateReply() {
        if (!currentConversation) return;

        const replies = [
            "Cảm ơn tin nhắn của bạn!",
            "Chúng tôi sẽ phản hồi bạn sớm nhất có thể.",
            "Bạn cần hỗ trợ thêm thông tin gì không?",
            "Đội ngũ của chúng tôi đang xem xét yêu cầu của bạn.",
            "Xin lỗi vì sự bất tiện này."
        ];

        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const replyMessage = {
            id: Date.now(),
            text: randomReply,
            sender: 'them',
            timestamp: new Date(),
            type: 'text'
        };

        if (!messageHistory[currentConversation]) {
            messageHistory[currentConversation] = [];
        }
        messageHistory[currentConversation].push(replyMessage);

        addMessageToUI(replyMessage);
    }

    // Hàm giả lập phản hồi ảnh
    function simulateImageReply() {
        if (!currentConversation) return;

        const sampleImages = [
            'https://via.placeholder.com/200/4299e1/ffffff?text=Sample+1',
            'https://via.placeholder.com/200/3182ce/ffffff?text=Sample+2',
            'https://via.placeholder.com/200/2b6cb0/ffffff?text=Sample+3'
        ];

        const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];

        const replyMessage = {
            id: Date.now(),
            imageUrl: randomImage,
            sender: 'them',
            timestamp: new Date(),
            type: 'image'
        };

        if (!messageHistory[currentConversation]) {
            messageHistory[currentConversation] = [];
        }
        messageHistory[currentConversation].push(replyMessage);

        addMessageToUI(replyMessage);
    }

    // Hàm cuộn xuống dưới cùng
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Hàm lấy avatar cho hội thoại
    function getAvatarForConversation(conversationId) {
        const conversation = document.querySelector(`.conversation[data-conversation-id="${conversationId}"]`);
        if (conversation) {
            return conversation.querySelector('.conversation-avatar img').src;
        }
        return 'https://via.placeholder.com/32';
    }

    // Hàm khởi tạo dữ liệu mẫu
    function initializeSampleData() {
        const conversationIds = Array.from(conversations).map(c => c.dataset.conversationId);

        conversationIds.forEach(id => {
            messageHistory[id] = [];

            // Thêm 1-2 tin nhắn mẫu cho mỗi hội thoại
            const messageCount = Math.floor(Math.random() * 2) + 1;

            for (let i = 0; i < messageCount; i++) {
                messageHistory[id].push({
                    id: Date.now() - i,
                    text: i === 0 ?
                        "Xin chào! Tôi có thể giúp gì cho bạn?" :
                        "Bạn cần hỗ trợ thêm thông tin gì không?",
                    sender: 'them',
                    timestamp: new Date(Date.now() - i * 60000),
                    type: 'text'
                });
            }
        });
    }
});
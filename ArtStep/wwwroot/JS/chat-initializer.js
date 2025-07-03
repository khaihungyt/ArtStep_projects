import { AIChatSystem } from './ai-chat.js';

// Initialize chat system
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get or create chat instance
        const chatSystem = AIChatSystem.getInstance();

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Reload chat history and check auth status when returning to the page
                chatSystem.loadChatHistory();
                chatSystem.checkAuthStatus();
            }
        });

        // Handle before unload to ensure chat history is saved
        window.addEventListener('beforeunload', () => {
            chatSystem.saveChatHistory();
        });

    } catch (error) {
        console.error('Error initializing chat system:', error);
    }
}); 
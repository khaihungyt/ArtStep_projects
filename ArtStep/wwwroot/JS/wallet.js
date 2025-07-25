import { API_BASE_URL } from './config.js';

// Wallet functionality module
export class WalletManager {
    constructor() {
        this.walletBalance = 0;
        this.isLoading = false;
        this.currentRequest = null;
    }

    // Get wallet balance from API
    async fetchWalletBalance() {
        console.log('WALLET DEBUG: fetchWalletBalance called');
        const token = localStorage.getItem('token');
        console.log('WALLET DEBUG: Token exists:', !!token);
        
        if (!token) {
            console.log('WALLET DEBUG: No token, returning null');
            return null;
        }

        // If there's already a request in progress, wait for it
        if (this.currentRequest) {
            console.log('WALLET DEBUG: Request already in progress, waiting for it...');
            return await this.currentRequest;
        }

        // Create and store the request promise
        this.currentRequest = this._makeBalanceRequest(token);
        
        try {
            const result = await this.currentRequest;
            return result;
        } finally {
            this.currentRequest = null;
        }
    }

    async _makeBalanceRequest(token) {
        try {
            this.isLoading = true;
            console.log('WALLET DEBUG: Making API call to:', `${API_BASE_URL}/wallet/balance`);
            
            const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('WALLET DEBUG: Response status:', response.status, response.ok);

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('WALLET DEBUG: 401 error, clearing localStorage');
                    // Token expired or invalid, clear localStorage
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    localStorage.removeItem('username');
                    localStorage.removeItem('userId');
                    window.location.reload();
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('WALLET DEBUG: API response data:', data);
            
            this.walletBalance = data.balance || 0;
            console.log('WALLET DEBUG: Set this.walletBalance to:', this.walletBalance);
            
            return this.walletBalance;
        } catch (error) {
            console.error('WALLET DEBUG: Error fetching wallet balance:', error);
            return null;
        } finally {
            this.isLoading = false;
            console.log('WALLET DEBUG: Finished fetching, isLoading set to false');
        }
    }

    // Format currency for display
    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Create wallet display HTML
    createWalletDisplay(balance) {
        return `
            <li class="nav-item">
                <a class="nav-link wallet-link" href="/wallet.html" id="walletDisplay">
                    <i class="bi bi-wallet2"></i> 
                    <span class="wallet-balance">${this.formatCurrency(balance)}</span>
                </a>
            </li>
        `;
    }

    // Update wallet display in header
    async updateWalletDisplay() {
        const walletDisplayElement = document.getElementById('walletDisplay');

        if (walletDisplayElement) {
            const balance = await this.fetchWalletBalance();
            if (balance !== null) {
                const balanceSpan = walletDisplayElement.querySelector('.wallet-balance');
                if (balanceSpan) {
                    balanceSpan.textContent = this.formatCurrency(balance);
                }
            }
        }
    }

    goToWallet() {
        window.location.href = 'wallet.html';
    }

    init() {
        this.addWalletStyles();

        setInterval(() => {
            if (localStorage.getItem('token')) {
                this.updateWalletDisplay();
            }
        }, 30000);
    }

    // Add CSS styles for wallet display
    addWalletStyles() {
        const existingStyle = document.getElementById('wallet-styles');
        if (existingStyle) return;

        const style = document.createElement('style');
        style.id = 'wallet-styles';
        style.textContent = `
            .wallet-link {
                transition: all 0.3s ease;
            }
            
            .wallet-link:hover {
                background-color: rgba(0, 123, 255, 0.1);
                border-radius: 5px;
            }
            
            .wallet-balance {
                font-weight: 600;
                color: #28a745;
            }
            
            .wallet-link:hover .wallet-balance {
                color: #218838;
            }
            
            .bi-wallet2 {
                margin-right: 5px;
            }
            
            @media (max-width: 768px) {
                .wallet-balance {
                    font-size: 0.9em;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Create and export a singleton instance
export const walletManager = new WalletManager();

// Initialize wallet manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    walletManager.init();
}); 
import { API_BASE_URL } from './config.js';
import './header.js'; // Import header functionality

class WalletPageManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.isLoading = false;
    }

    // Initialize wallet page
    async init() {
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        await this.loadWalletInfo();
        await this.loadTransactionHistory();
        this.setupEventListeners();
    }

    // Load wallet balance and info
    async loadWalletInfo() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.displayWalletInfo(data);
        } catch (error) {
            console.error('Error loading wallet info:', error);
            this.showError('Failed to load wallet information');
        }
    }

    // Display wallet information
    displayWalletInfo(walletData) {
        const balanceElement = document.getElementById('wallet-balance');
        const walletIdElement = document.getElementById('wallet-id');
        const lastUpdatedElement = document.getElementById('last-updated');

        if (balanceElement) {
            balanceElement.textContent = this.formatCurrency(walletData.balance);
        }
        if (walletIdElement) {
            walletIdElement.textContent = walletData.walletId || 'N/A';
        }
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = new Date(walletData.updatedAt).toLocaleString('vi-VN');
        }
    }

    // Load transaction history
    async loadTransactionHistory(page = 1) {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/wallet/transactions?page=${page}&pageSize=${this.pageSize}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.displayTransactionHistory(data);
            this.setupPagination(data);
        } catch (error) {
            console.error('Error loading transaction history:', error);
            this.showError('Failed to load transaction history');
        } finally {
            this.isLoading = false;
        }
    }

    // Display transaction history
    displayTransactionHistory(data) {
        const transactionList = document.getElementById('transaction-list');
        if (!transactionList) return;

        if (!data.transactions || data.transactions.length === 0) {
            transactionList.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                    <p class="text-muted mt-2">No transactions found</p>
                </div>
            `;
            return;
        }

        transactionList.innerHTML = data.transactions.map(transaction => {
            const isPositive = transaction.amount > 0;
            const typeClass = this.getTransactionTypeClass(transaction.transactionType);
            const statusClass = this.getStatusClass(transaction.status);

            return `
                <div class="transaction-item border-bottom py-3">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <span class="badge ${typeClass}">${transaction.transactionType}</span>
                        </div>
                        <div class="col-md-3">
                            <div class="fw-semibold ${isPositive ? 'text-success' : 'text-danger'}">
                                ${isPositive ? '+' : ''}${this.formatCurrency(transaction.amount)}
                            </div>
                            <small class="text-muted">Balance: ${this.formatCurrency(transaction.balanceAfter)}</small>
                        </div>
                        <div class="col-md-4">
                            <div class="transaction-description">
                                ${transaction.description || 'N/A'}
                            </div>
                            ${transaction.paymentMethod ? `<small class="text-muted">via ${transaction.paymentMethod}</small>` : ''}
                        </div>
                        <div class="col-md-2">
                            <span class="badge ${statusClass}">${transaction.status}</span>
                        </div>
                        <div class="col-md-1 text-end">
                            <small class="text-muted">
                                ${new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                            </small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Setup pagination
    setupPagination(data) {
        const pagination = document.getElementById('pagination');
        if (!pagination || data.totalPages <= 1) {
            if (pagination) pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        if (data.currentPage > 1) {
            paginationHTML += `<button class="btn btn-outline-primary btn-sm me-1" onclick="walletPageManager.loadTransactionHistory(${data.currentPage - 1})">Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= data.totalPages; i++) {
            if (i === data.currentPage) {
                paginationHTML += `<button class="btn btn-primary btn-sm me-1" disabled>${i}</button>`;
            } else {
                paginationHTML += `<button class="btn btn-outline-primary btn-sm me-1" onclick="walletPageManager.loadTransactionHistory(${i})">${i}</button>`;
            }
        }

        // Next button
        if (data.currentPage < data.totalPages) {
            paginationHTML += `<button class="btn btn-outline-primary btn-sm" onclick="walletPageManager.loadTransactionHistory(${data.currentPage + 1})">Next</button>`;
        }

        pagination.innerHTML = paginationHTML;
    }

    // Setup event listeners
    setupEventListeners() {
        const rechargeBtn = document.getElementById('recharge-btn');
        if (rechargeBtn) {
            rechargeBtn.addEventListener('click', () => this.showRechargeModal());
        }

        const rechargeForm = document.getElementById('recharge-form');
        if (rechargeForm) {
            rechargeForm.addEventListener('submit', (e) => this.handleRecharge(e));
        }

        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }
    }

    // Show recharge modal
    showRechargeModal() {
        const modal = document.getElementById('recharge-modal');
        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    // Handle recharge form submission
    async handleRecharge(event) {
        event.preventDefault();
        
        const amountInput = document.getElementById('recharge-amount');
        const descriptionInput = document.getElementById('recharge-description');
        
        if (!amountInput) return;

        const amount = parseFloat(amountInput.value);
        const description = descriptionInput ? descriptionInput.value : '';

        if (amount < 10000) {
            this.showError('Minimum recharge amount is 10,000 VND');
            return;
        }

        if (amount > 50000000) {
            this.showError('Maximum recharge amount is 50,000,000 VND');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/wallet/recharge`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount,
                    description: description
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Recharge failed');
            }

            const result = await response.json();
            
            // Check if it's the maintenance mode response (auto-success)
            if (result.success && result.message) {
                // Close the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('recharge-modal'));
                if (modal) {
                    modal.hide();
                }

                // Show success message
                await Swal.fire({
                    title: 'Recharge Successful!',
                    html: `
                        <div class="text-center">
                            <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
                            <p class="mt-3 mb-2"><strong>Amount:</strong> ${this.formatCurrency(result.amount)}</p>
                            <p class="mb-2"><strong>New Balance:</strong> ${this.formatCurrency(result.newBalance)}</p>
                            <p class="mb-0 text-info"><small>${result.message}</small></p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745'
                });

                // Refresh wallet data
                await this.refresh();
                
            } else if (result.paymentUrl) {
                // Normal VNPay redirect (when not in maintenance mode)
                window.location.href = result.paymentUrl;
            } else if (typeof result === 'string' && result.includes('vnpay')) {
                // Legacy string response - direct payment URL
                window.location.href = result;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error during recharge:', error);
            this.showError(error.message || 'Failed to process recharge');
        }
    }

    // Refresh wallet data
    async refresh() {
        await this.loadWalletInfo();
        await this.loadTransactionHistory(this.currentPage);
        
        // Update header wallet display
        if (window.headerManager) {
            await window.headerManager.updateWalletBalance();
        }
    }

    // Helper methods
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

    getTransactionTypeClass(type) {
        switch (type) {
            case 'CHARGE': return 'bg-success';
            case 'PAYMENT': return 'bg-primary';
            case 'REFUND': return 'bg-info';
            case 'WITHDRAWAL': return 'bg-warning';
            default: return 'bg-secondary';
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'COMPLETED': return 'bg-success';
            case 'PENDING': return 'bg-warning';
            case 'FAILED': return 'bg-danger';
            case 'CANCELLED': return 'bg-secondary';
            default: return 'bg-secondary';
        }
    }

    showError(message) {
        // You can replace this with your preferred notification system
        alert(message);
    }

    showSuccess(message) {
        // You can replace this with your preferred notification system
        alert(message);
    }
}

// Create global instance
window.walletPageManager = new WalletPageManager();

// Export global functions for onclick handlers
window.showRechargeModal = function() {
    window.walletPageManager.showRechargeModal();
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    await window.walletPageManager.init();
}); 
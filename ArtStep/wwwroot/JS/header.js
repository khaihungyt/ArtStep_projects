import { API_BASE_URL } from './config.js';
import { WalletManager } from './wallet.js';

export class HeaderManager {
    constructor() {
        this.walletManager = new WalletManager();
    }

    async initializeHeader() {
        const navbarAuth = document.getElementById('navbarAuth');
        if (!navbarAuth) {
            console.warn('navbarAuth element not found');
            return;
        }

        const token = localStorage.getItem('token');

        if (token) {
            await this.renderAuthenticatedHeader(navbarAuth);
        } else {
            this.renderUnauthenticatedHeader(navbarAuth);
        }
    }

    async renderAuthenticatedHeader(navbarAuth) {
        try {
            const walletBalance = await this.walletManager.fetchWalletBalance();
            
            navbarAuth.innerHTML = `
                ${walletBalance !== null ? this.walletManager.createWalletDisplay(walletBalance) : ''}
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="goToCart()">
                        <i class="bi bi-cart"></i> Cart
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="profile.html">
                        <i class="bi bi-person-circle"></i> Profile
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" id="logoutBtn">
                        <i class="bi bi-box-arrow-right"></i> Log out
                    </a>
                </li>
            `;

            this.walletManager.init();

            // Add logout functionality
            this.setupLogoutHandler();

        } catch (error) {
            console.error('Error rendering authenticated header:', error);
            navbarAuth.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="goToCart()">
                        <i class="bi bi-cart"></i> Cart
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="profile.html">
                        <i class="bi bi-person-circle"></i> Profile
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" id="logoutBtn">
                        <i class="bi bi-box-arrow-right"></i> Log out
                    </a>
                </li>
            `;
            this.setupLogoutHandler();
        }
    }

    renderUnauthenticatedHeader(navbarAuth) {
        navbarAuth.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="Login.html">
                    <i class="bi bi-person-circle"></i> Login
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="Register.html">
                    <i class="bi bi-person-plus"></i> Register
                </a>
            </li>
        `;
    }

    setupLogoutHandler() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('username');
                localStorage.removeItem('userId');
                window.location.reload();
            });
        }
    }

    // Update wallet balance in header (for use after transactions)
    async updateWalletBalance() {
        if (localStorage.getItem('token')) {
            await this.walletManager.updateWalletDisplay();
        }
    }

    async getCurrentWalletBalance() {
        return await this.walletManager.fetchWalletBalance();
    }
}

window.headerManager = new HeaderManager();

window.goToCart = function() {
    window.location.href = 'cart';
};

window.goToWallet = function() {
    window.location.href = 'wallet';
};

document.addEventListener('DOMContentLoaded', async function() {
    await window.headerManager.initializeHeader();
}); 
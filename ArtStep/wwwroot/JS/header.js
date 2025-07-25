import { API_BASE_URL } from './config.js';
import { walletManager } from '/JS/wallet.js';

// Quản lý phần Header (Thanh điều hướng)
class HeaderManager {
    constructor() {
        this.walletManager = walletManager;
    }

    // Khởi tạo header tùy theo trạng thái đăng nhập
    async initializeHeader() {
        const navbarAuth = document.getElementById('navbarAuth');
        if (!navbarAuth) {
            console.warn('Không tìm thấy phần tử navbarAuth');
            return;
        }

        const token = localStorage.getItem('token');

        if (token) {
            await this.renderAuthenticatedHeader(navbarAuth); // Nếu đã đăng nhập
        } else {
            this.renderUnauthenticatedHeader(navbarAuth); // Nếu chưa đăng nhập
        }
    }

    // Header cho người dùng đã đăng nhập
    async renderAuthenticatedHeader(navbarAuth) {
        try {
            const walletBalance = await this.walletManager.fetchWalletBalance();

            navbarAuth.innerHTML = `
                ${walletBalance !== null ? this.walletManager.createWalletDisplay(walletBalance) : ''}
                <li class="nav-item">
                    <a class="nav-link"
                       href="/Cart.html"
                       style="color: white; padding: 8px 16px; border-radius: 6px; transition: 0.3s;"
                       onmouseover="this.style.color='chocolate';"
                       onmouseout="this.style.color='white';">
                       <i class="bi bi-cart" style="margin-right: 6px;"></i> Giỏ hàng
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link"
                       href="UserProfile.html"
                       style="color: white; padding: 8px 16px; border-radius: 6px; transition: 0.3s;"
                       onmouseover="this.style.color='chocolate';"
                       onmouseout="this.style.color='white';">
                       <i class="bi bi-person-circle" style="margin-right: 6px;"></i> Hồ sơ
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link"
                       href="#"
                       id="logoutBtn"
                       style="color: white; padding: 8px 16px; border-radius: 6px; transition: 0.3s;"
                       onmouseover="this.style.color='chocolate';"
                       onmouseout="this.style.color='white';">
                       <i class="bi bi-box-arrow-right" style="margin-right: 6px;"></i> Đăng xuất
                    </a>
                </li>
            `;

            this.walletManager.init();
            this.setupLogoutHandler(); // Gán chức năng đăng xuất

        } catch (error) {
            console.error('Lỗi khi hiển thị header người dùng:', error);
            navbarAuth.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link"
                       href="/Cart.html"
                       style="color: white; padding: 8px 16px; border-radius: 6px; transition: 0.3s;"
                       onmouseover="this.style.color='chocolate';"
                       onmouseout="this.style.color='white';">
                       <i class="bi bi-cart" style="margin-right: 6px;"></i> Giỏ hàng
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link"
                       href="/UserProfile.html"
                       style="color: white; padding: 8px 16px; border-radius: 6px; transition: 0.3s;"
                       onmouseover="this.style.color='chocolate';"
                       onmouseout="this.style.color='white';">
                       <i class="bi bi-person-circle" style="margin-right: 6px;"></i> Hồ sơ
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link"
                       href="#"
                       id="logoutBtn"
                       style="color: white; padding: 8px 16px; border-radius: 6px; transition: 0.3s;"
                       onmouseover="this.style.color='chocolate';"
                       onmouseout="this.style.color='white';">
                       <i class="bi bi-box-arrow-right" style="margin-right: 6px;"></i> Đăng xuất
                    </a>
                </li>
            `;
            this.setupLogoutHandler();
        }
    }

    // Header cho người dùng chưa đăng nhập
    renderUnauthenticatedHeader(navbarAuth) {
        navbarAuth.innerHTML = `
            <li class="nav-item">
                <a class="nav-link"
                   href="/Login.html"
                   style="color: white; padding: 8px 16px; border-radius: 6px; transition: 0.3s;"
                   onmouseover="this.style.color='chocolate';"
                   onmouseout="this.style.color='white';">
                   <i class="bi bi-person-circle" style="margin-right: 6px;"></i> Đăng nhập
                </a>
            </li>

            <li class="nav-item">
                <a class="nav-link"
                   href="/Register.html"
                   style="color: white; padding: 8px 16px; border-radius: 6px; transition: 0.3s;"
                   onmouseover="this.style.color='chocolate';"
                   onmouseout="this.style.color='white';">
                   <i class="bi bi-person-plus" style="margin-right: 6px;"></i> Đăng ký
                </a>
            </li>
        `;
    }

    // Xử lý khi người dùng nhấn nút Đăng xuất
    setupLogoutHandler() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('username');
                localStorage.removeItem('userId');
                window.location.reload();
            });
        }
    }

    // Cập nhật số dư ví trong header sau khi thực hiện giao dịch
    async updateWalletBalance() {
        if (localStorage.getItem('token')) {
            await this.walletManager.updateWalletDisplay();
        }
    }

    // Lấy số dư ví hiện tại
    async getCurrentWalletBalance() {
        return await this.walletManager.fetchWalletBalance();
    }

    // Navigation functions
    goToCart() {
        window.location.href = '/Cart.html';
    }

    goToWallet() {
        window.location.href = '/wallet.html';
    }
}

// Create and export a singleton instance
const headerManager = new HeaderManager();
export { headerManager };

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await headerManager.initializeHeader();
});

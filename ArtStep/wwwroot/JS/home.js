import { API_BASE_URL } from './config.js';
import './header.js';

document.addEventListener('DOMContentLoaded', async function () {
    await new Promise(resolve => setTimeout(resolve, 100));
    const boLocNhaThietKe = document.getElementById('designerFilter');

    async function taiDanhSachNhaThietKe() {
        try {
            const response = await fetch(`${API_BASE_URL}/designers`);
            if (!response.ok) {
                throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
            }
            const data = await response.json();
            const danhSach = data || [];

            if (!Array.isArray(danhSach)) {
                console.error('Dữ liệu nhà thiết kế không phải là một mảng:', data);
                return;
            }
            if (boLocNhaThietKe) {
                boLocNhaThietKe.innerHTML = '<option value="">Tất cả nhà thiết kế</option>';
                danhSach.forEach(nhaThietKe => {
                    const option = document.createElement('option');
                    option.value = nhaThietKe.userId || nhaThietKe.designerId;
                    option.textContent = nhaThietKe.name || nhaThietKe.designerName;
                    boLocNhaThietKe.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách nhà thiết kế:', error);
        }
    }

    await taiDanhSachNhaThietKe();

    const boLocPhongCach = document.getElementById('styleFilter');

    async function taiDanhSachDanhMuc() {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) {
                throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
            }
            const data = await response.json();
            const danhSach = data || [];

            if (!Array.isArray(danhSach)) {
                console.error('Dữ liệu danh mục không phải là một mảng:', data);
                return;
            }
            if (boLocPhongCach) {
                boLocPhongCach.innerHTML = '<option value="">Tất cả danh mục</option>';
                danhSach.forEach(danhMuc => {
                    const option = document.createElement('option');
                    option.value = danhMuc.categoryId;
                    option.textContent = danhMuc.name || danhMuc.categoryName;
                    boLocPhongCach.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
        }
    }

    // Define best sellers functions first
    async function loadBestSellers() {
        try {
            console.log('Loading best sellers from:', `${API_BASE_URL}/bestsellers`);
            const response = await fetch(`${API_BASE_URL}/bestsellers`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const bestSellers = await response.json();
            console.log('Best sellers data:', bestSellers);
            renderBestSellers(bestSellers);
        } catch (error) {
            console.error('Error loading best sellers:', error);
            // Hide the best sellers section if there's an error
            const bestSellersContainer = document.querySelector('.container.my-5');
            if (bestSellersContainer) {
                bestSellersContainer.style.display = 'none';
            }
        }
    }

    function renderBestSellers(products) {
        const bestSellersContainer = document.getElementById('bestSellersList');
        if (!bestSellersContainer) {
            console.error('Best sellers container not found');
            return;
        }
        
        if (!Array.isArray(products) || products.length === 0) {
            console.log('No best sellers data or empty array');
            bestSellersContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Không có dữ liệu sản phẩm bán chạy</p></div>';
            return;
        }

        console.log('Rendering best sellers:', products);

        const bestSellersHTML = products.map((product, index) => {
            const designerId = product.DesignerUserId;
            const designerName = product.Designer;
            const shoeId = product.ShoeId;
            const productName = product.Name;
            const productPrice = product.Price || 0;
            const productStyle = product.Style || 'N/A';
            const productImage = product.ImageUrl || 'placeholder.jpg';
            const totalSold = product.TotalSold || 0;

            return `
                <div class="col-lg-3 col-md-3 col-sm-4 col-6 mb-4">
                    <div class="card bestseller-card h-100">
                        <div class="bestseller-badge">
                            #${index + 1} HOT
                        </div>
                        <img src="${productImage}" 
                             class="card-img-top bestseller-image" 
                             alt="${productName}">
                        <div class="card-body d-flex flex-column text-center">
                            <h6 class="card-title bestseller-title fw-bold mb-2">${productName}</h6>
                            <p class="text-muted small mb-2">${designerName || 'N/A'}</p>
                            <p class="text-muted small mb-2">${productStyle}</p>
                            <div class="sold-count mb-2">
                                <i class="bi bi-fire"></i> ${totalSold} đã bán
                            </div>
                            <h5 class="bestseller-price mb-3">$${productPrice}</h5>
                            <button onclick="orderNow('${shoeId}')" 
                                    class="btn order-now-btn mt-auto">
                                Đặt ngay
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        bestSellersContainer.innerHTML = bestSellersHTML;
    }

    // Load best sellers after functions are defined
    await loadBestSellers();

    const productList = document.getElementById('productList');
    const paginationElement = document.getElementById('pagination');

    const danhSachSanPham = document.getElementById('productList');
    const thanhPhanTrang = document.getElementById('pagination');

    let trangHienTai = 1;
    const sanPhamMoiTrang = 6;

    let boLocHienTai = {
        style: '',
        designer: '',
        search: ''
    };

    async function taiSanPham() {
        const queryParams = new URLSearchParams({
            page: trangHienTai,
            limit: sanPhamMoiTrang,
            style: boLocHienTai.style,
            price: boLocHienTai.price,
            designer: boLocHienTai.designer,
            search: boLocHienTai.search
        }).toString();

        try {
            const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
            if (!response.ok) {
                throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
            }

            const data = await response.json();
            const sanPham = data.products || [];
            const tongSanPham = data.total || 0;

            if (!Array.isArray(sanPham)) {
                console.error('Dữ liệu sản phẩm không hợp lệ:', data);
                return;
            }

            if (!danhSachSanPham) {
                console.error('Không tìm thấy phần hiển thị sản phẩm');
                return;
            }

            danhSachSanPham.innerHTML = '';
            sanPham.forEach(sp => {
                const maThietKe = sp.designerUserId || sp.DesignerUserId;
                const tenThietKe = sp.designer || sp.Designer;
                const maGiay = sp.shoeId || sp.ShoeId;
                const theSanPham = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${sp.imageUrl || sp.ImageUrl || 'placeholder.jpg'}" 
                             class="card-img-top" alt="${sp.name || sp.Name}" 
                             style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${sp.name || sp.Name}</h5>
                            <p class="card-text text-muted">
                                Phong cách: ${sp.style || sp.Style || 'Không rõ'}<br>
                                Nhà thiết kế: ${tenThietKe || 'Không rõ'}
                            </p>
                            <h4 class="card-subtitle mb-2 text-primary mt-auto">${sp.price || sp.Price || 0} đ</h4>
                            <div class="d-flex gap-2 mt-2">
                                <button onclick="viewProductDetails('${maGiay}')" class="btn btn-dark flex-grow-1">Xem chi tiết</button>
                                <button onclick="addToCart('${maGiay}')" class="btn btn-outline-primary">
                                    <i class="lnr lnr-cart"></i>
                                </button>
                            </div>
                            <div class="mt-2">
                                ${maThietKe && localStorage.getItem('role')?.toLowerCase() === 'user' ?
                        `<button onclick="chatWithDesigner('${maThietKe}', '${tenThietKe}')" 
                             class="btn btn-outline-success btn-sm w-100">
                             <i class="bi bi-chat-dots"></i> Chat với Nhà Thiết Kế
                         </button>` :
                        localStorage.getItem('role')?.toLowerCase() === 'designer' ?
                            `<button class="btn btn-outline-secondary btn-sm w-100" disabled>
                             <i class="bi bi-info-circle"></i> Tài khoản Nhà thiết kế
                         </button>` :
                            !localStorage.getItem('token') ?
                                `<button onclick="chatWithDesigner('${maThietKe}', '${tenThietKe}')" 
                                     class="btn btn-outline-success btn-sm w-100">
                                     <i class="bi bi-chat-dots"></i> Chat với Nhà Thiết Kế
                                 </button>` :
                                `<button class="btn btn-outline-secondary btn-sm w-100" disabled>
                                 <i class="bi bi-chat-dots"></i> Không thể Chat
                             </button>`
                    }
                            </div>
                        </div>
                    </div>
                </div>
                `;
                danhSachSanPham.innerHTML += theSanPham;
            });
            renderPagination(tongSanPham);
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
            if (danhSachSanPham) {
                danhSachSanPham.innerHTML = '<p class="text-danger">Lỗi khi tải sản phẩm.</p>';
            }
        }
    }

    function renderPagination(tongSanPham) {
        thanhPhanTrang.innerHTML = '';
        const tongTrang = Math.ceil(tongSanPham / sanPhamMoiTrang);

        if (tongTrang <= 1) return;

        // Nút trước
        const prev = document.createElement('li');
        prev.classList.add('page-item', trangHienTai === 1 ? 'disabled' : '');
        prev.innerHTML = `<a class="page-link" href="#">&laquo;</a>`;
        prev.addEventListener('click', e => {
            e.preventDefault();
            if (trangHienTai > 1) {
                trangHienTai--;
                taiSanPham();
            }
        });
        thanhPhanTrang.appendChild(prev);

        // Các nút số
        for (let i = 1; i <= tongTrang; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item', trangHienTai === i ? 'active' : '');
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener('click', e => {
                e.preventDefault();
                trangHienTai = i;
                taiSanPham();
            });
            thanhPhanTrang.appendChild(li);
        }

        // Nút sau
        const next = document.createElement('li');
        next.classList.add('page-item', trangHienTai === tongTrang ? 'disabled' : '');
        next.innerHTML = `<a class="page-link" href="#">&raquo;</a>`;
        next.addEventListener('click', e => {
            e.preventDefault();
            if (trangHienTai < tongTrang) {
                trangHienTai++;
                taiSanPham();
            }
        });
        thanhPhanTrang.appendChild(next);
    }

    // Các bộ lọc
    const boLocGia = document.getElementById('priceFilter');
    const oTimKiem = document.getElementById('searchInput');
    const nutTimKiem = document.getElementById('searchButton');

    boLocNhaThietKe.addEventListener('change', function () {
        boLocHienTai.designer = this.value;
        trangHienTai = 1;
        taiSanPham();
    });

    boLocPhongCach.addEventListener('change', function () {
        boLocHienTai.style = this.value;
        trangHienTai = 1;
        taiSanPham();
    });

    boLocGia.addEventListener('change', function () {
        boLocHienTai.price = this.value;
        trangHienTai = 1;
        taiSanPham();
    });

        if (!token) {
            console.log('No token found, showing login prompt');
            Swal.fire({
                title: 'Login Required',
                text: 'Please login to chat with designer!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập',
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'login';
                }
            });
            return;
        }
        if (!userRole || userRole.toLowerCase() !== 'user') {
            console.log('User role check failed:', userRole);
            Swal.fire({
                title: 'Access Denied',
                text: 'Only customers can chat with designers!',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Redirect to designers page with chat parameters
        window.location.href = `designers.html?chatWith=${designerUserId}&designerName=${encodeURIComponent(designerName)}`;
    }

    if (nutTimKiem) {
        nutTimKiem.addEventListener('click', function () {
            boLocHienTai.search = oTimKiem.value;
            trangHienTai = 1;
            taiSanPham();
        });
    }

        window.location.href = 'cart';
    }

    window.orderNow = function (shoeId) {
        // Redirect to product detail page for immediate ordering
        window.location.href = `product-detail.html?id=${shoeId}`;
    }
});
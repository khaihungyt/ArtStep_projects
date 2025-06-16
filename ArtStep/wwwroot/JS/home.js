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

    await taiDanhSachDanhMuc();

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

    if (oTimKiem) {
        oTimKiem.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                boLocHienTai.search = this.value;
                trangHienTai = 1;
                taiSanPham();
            }
        });
    }

    if (nutTimKiem) {
        nutTimKiem.addEventListener('click', function () {
            boLocHienTai.search = oTimKiem.value;
            trangHienTai = 1;
            taiSanPham();
        });
    }

    await taiSanPham();
});

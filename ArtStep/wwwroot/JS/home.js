document.addEventListener('DOMContentLoaded', function () {
    localStorage.clear();
    const navbarAuth = document.getElementById('navbarAuth');
    const token = localStorage.getItem('token');

    if (token) {
        navbarAuth.innerHTML = `
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
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.reload();
        });
    } else {
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

     //tải danh sách Designers
    const designerFilter = document.getElementById('designerFilter');

    async function fetchDesigners() {
        try {
            const response = await fetch('http://localhost:5155/api/designers');

            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return;
            }

            const designers = await response.json();

            designers.forEach(designer => {
                const option = document.createElement('option');
                option.value = designer.userId;
                option.textContent = designer.name;
                designerFilter.appendChild(option);
            });

        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
    fetchDesigners();

    //tải danh sách Categorys
    const styleFilter = document.getElementById('styleFilter');

    async function fetchCategories() {
        try {
            const response = await fetch('http://localhost:5155/api/categories');

            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return;
            }
            const categories = await response.json(); 

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categoryId;
                option.textContent = category.categoryName;
                styleFilter.appendChild(option);
            });

        } catch (error) {
            console.error('There was a problem with the fetch operation for categories:', error);
        }
    }
    fetchCategories();

    const productList = document.getElementById('productList');
    const paginationElement = document.getElementById('pagination');

    let currentPage = 1;
    const productsPerPage = 6;

    let currentFilters = {
        style: '',
        designer: '',
        search: ''
    };

    async function fetchProducts() {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: productsPerPage,
            style: currentFilters.style,
            price: currentFilters.price,
            designer: currentFilters.designer,
            search: currentFilters.search
        }).toString();

        try {
            const response = await fetch(`http://localhost:5155/api/products?${queryParams}`);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                productList.innerHTML = '<p class="text-danger">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>';
                return;
            }

            const data = await response.json();
            const products = data.products;
            const totalProducts = data.total;

            renderProducts(products);
            renderPagination(totalProducts);

        } catch (error) {
            console.error('There was a problem with the fetch operation for products:', error);
            productList.innerHTML = '<p class="text-danger">Đã xảy ra lỗi khi tải sản phẩm.</p>';
        }
    }

    //tải Products
    function renderProducts(products) {
        productList.innerHTML = '';

        if (products.length === 0) {
            productList.innerHTML = '<p class="text-center w-100">Không tìm thấy sản phẩm nào.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                             class="card-img-top" alt="${product.name}" 
                             style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text text-muted">
                                Style: ${product.style || 'N/A'}<br>
                                Designer: ${product.designer || 'N/A'}
                            </p>
                            <h4 class="card-subtitle mb-2 text-primary mt-auto">${product.price.toFixed(2)} VNĐ</h4>
                            <a href="product-detail.html?id=${product.shoeId}" class="btn btn-dark mt-2">View Details</a>
                        </div>
                    </div>
                </div>
            `;
            productList.innerHTML += productCard;
        });
    }

    //tải phân trang
    function renderPagination(totalProducts) {
        paginationElement.innerHTML = '';

        const totalPages = Math.ceil(totalProducts / productsPerPage);

        if (totalPages <= 1) {
            return;
        }

        // Previous button
        const prevLi = document.createElement('li');
        prevLi.classList.add('page-item', currentPage === 1 ? 'disabled' : '');
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevLi.addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                fetchProducts();
            }
        });
        paginationElement.appendChild(prevLi);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement('li');
            pageLi.classList.add('page-item', currentPage === i ? 'active' : '');
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLi.addEventListener('click', function (e) {
                e.preventDefault();
                currentPage = i;
                fetchProducts();
            });
            paginationElement.appendChild(pageLi);
        }

        // Next button
        const nextLi = document.createElement('li');
        nextLi.classList.add('page-item', currentPage === totalPages ? 'disabled' : '');
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        nextLi.addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                fetchProducts();
            }
        });
        paginationElement.appendChild(nextLi);
    }

    // Filter Event Listeners
    const priceFilter = document.getElementById('priceFilter');
    const searchInput = document.getElementById('searchInput'); 
    const searchButton = document.getElementById('searchButton');

    designerFilter.addEventListener('change', function () {
        currentFilters.designer = this.value;
        currentPage = 1;
        fetchProducts();
    });

    styleFilter.addEventListener('change', function () {
        currentFilters.style = this.value;
        currentPage = 1;
        fetchProducts();
    });

    priceFilter.addEventListener('change', function () {
        currentFilters.price = this.value;
        currentPage = 1;
        fetchProducts();
    });

    if (searchInput) {
        searchInput.addEventListener('keyup', function (event) {
            if (event.key === 'Enter') {
                currentFilters.search = this.value;
                currentPage = 1;
                fetchProducts();
            }
        });
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            currentFilters.search = searchInput.value;
            currentPage = 1;
            fetchProducts();
        });
    }
    fetchProducts();
});
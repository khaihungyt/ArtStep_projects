document.addEventListener('DOMContentLoaded', function () {
    const navbarAuth = document.getElementById('navbarAuth');
    const token = localStorage.getItem('token');

    if (token) {
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
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Handle clean JSON response format
            const designers = data || [];
            
            if (!Array.isArray(designers)) {
                console.error('Designers data is not an array:', data);
                return;
            }

            // Update the designer filter dropdown instead of a container
            if (designerFilter) {
                designerFilter.innerHTML = '<option value="">All Designers</option>';
                designers.forEach(designer => {
                    const option = document.createElement('option');
                    option.value = designer.userId || designer.designerId;
                    option.textContent = designer.name || designer.designerName;
                    designerFilter.appendChild(option);
                });
            }
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Handle clean JSON response format
            const categories = data || [];
            
            if (!Array.isArray(categories)) {
                console.error('Categories data is not an array:', data);
                return;
            }

            // Update the style filter dropdown instead of a container
            if (styleFilter) {
                styleFilter.innerHTML = '<option value="">All Categories</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.categoryId;
                    option.textContent = category.name || category.categoryName;
                    styleFilter.appendChild(option);
                });
            }
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Handle clean JSON response format
            const products = data.products || [];
            const totalProducts = data.total || 0;
            
            if (!Array.isArray(products)) {
                console.error('Products data is not an array:', data);
                return;
            }

            const productList = document.getElementById('productList');
            if (!productList) {
                console.error('Product list container not found');
                return;
            }

            productList.innerHTML = '';
            products.forEach(product => {
                console.log('Product data:', product); // Debug log
                
                const designerId = product.designerUserId || product.DesignerUserId;
                const designerName = product.designer || product.Designer;
                const shoeId = product.shoeId || product.ShoeId;
                
                console.log('Designer info:', { designerId, designerName, shoeId }); // Debug log
                
                const productCard = `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <img src="${product.imageUrl || product.ImageUrl || 'placeholder.jpg'}" 
                                 class="card-img-top" alt="${product.name || product.Name}" 
                                 style="height: 200px; object-fit: cover;">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${product.name || product.Name}</h5>
                                <p class="card-text text-muted">
                                    Style: ${product.style || product.Style || 'N/A'}<br>
                                    Designer: ${designerName || 'N/A'}
                                </p>
                                <h4 class="card-subtitle mb-2 text-primary mt-auto">$${product.price || product.Price || 0}</h4>
                                <div class="d-flex gap-2 mt-2">
                                    <button onclick="viewProductDetails('${shoeId}')" class="btn btn-dark flex-grow-1">View Details</button>
                                    <button onclick="addToCart('${shoeId}')" class="btn btn-outline-primary">
                                        <i class="lnr lnr-cart"></i>
                                    </button>
                                </div>
                                <div class="mt-2">
                                    ${designerId && localStorage.getItem('role') && localStorage.getItem('role').toLowerCase() === 'user' ? 
                                        `<button onclick="chatWithDesigner('${designerId}', '${designerName}', '${shoeId}')" 
                                                class="btn btn-outline-success btn-sm w-100">
                                            <i class="bi bi-chat-dots"></i> Chat with Designer
                                        </button>` :
                                        localStorage.getItem('role') && localStorage.getItem('role').toLowerCase() === 'designer' ?
                                        `<button class="btn btn-outline-secondary btn-sm w-100" disabled>
                                            <i class="bi bi-info-circle"></i> Designer Account
                                        </button>` :
                                        !localStorage.getItem('token') ?
                                        `<button onclick="chatWithDesigner('${designerId}', '${designerName}', '${shoeId}')" 
                                                class="btn btn-outline-success btn-sm w-100">
                                            <i class="bi bi-chat-dots"></i> Chat with Designer
                                        </button>` :
                                        `<button class="btn btn-outline-secondary btn-sm w-100" disabled>
                                            <i class="bi bi-chat-dots"></i> Designer Not Available
                                        </button>`
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                productList.innerHTML += productCard;
            });

            renderPagination(totalProducts);
        } catch (error) {
            console.error('There was a problem with the fetch operation for products:', error);
            const productList = document.getElementById('productList');
            if (productList) {
                productList.innerHTML = '<p class="text-danger">Đã xảy ra lỗi khi tải sản phẩm.</p>';
            }
        }
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

    // Add to Cart function
    window.addToCart = async function(shoeId) {
        const token = localStorage.getItem('token');

        if (!token) {
            const result = await Swal.fire({
                title: 'Login Required',
                text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập',
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33'
            });

            if (result.isConfirmed) {
                window.location.href = 'Login.html';
            }
            return;
        }

        try {
            const requestBody = {
                shoeId: shoeId,
                quantity: 1
            };

            const response = await fetch('http://localhost:5155/api/Cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.trim()}`
                },
                body: JSON.stringify(requestBody)
            });

            let responseData;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                const responseText = await response.text();
                
                try {
                    responseData = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error('Invalid JSON response from server');
                }
            } else {
                const responseText = await response.text();
                console.error('Non-JSON response:', responseText);
                throw new Error('Server returned non-JSON response');
            }

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    const result = await Swal.fire({
                        title: 'Session Expired',
                        text: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Đăng nhập',
                        cancelButtonText: 'Hủy',
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33'
                    });

                    if (result.isConfirmed) {
                        window.location.href = 'Login.html';
                    }
                    return;
                }
                throw new Error(responseData.message || 'Failed to add to cart');
            }

            const result = await Swal.fire({
                title: 'Success!',
                text: responseData.message || 'Đã thêm sản phẩm vào giỏ hàng!',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Xem giỏ hàng',
                cancelButtonText: 'Tiếp tục mua sắm',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#28a745'
            });

            if (result.isConfirmed) {
                window.location.href = 'cart.html';
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            await Swal.fire({
                title: 'Error!',
                text: error.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại!',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        }
    }

    // View Product Details function
    window.viewProductDetails = function(shoeId) {
        window.location.href = `product-detail.html?id=${shoeId}`;
    }

    // Chat with Designer function
    window.chatWithDesigner = function(designerUserId, designerName, shoeId) {
        console.log('chatWithDesigner called with:', designerUserId, designerName, shoeId);
        
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');

        if (!token) {
            console.log('No token found, showing login prompt');
            Swal.fire({
                title: 'Login Required',
                text: 'Vui lòng đăng nhập để chat với designer!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập',
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'Login.html';
                }
            });
            return;
        }

        // Check if user has the correct role
        if (!userRole || userRole.toLowerCase() !== 'user') {
            console.log('User role check failed:', userRole);
            Swal.fire({
                title: 'Access Denied',
                text: 'Chỉ có khách hàng mới có thể chat với designer!',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        console.log('Token and role found, checking chat system...');

        // Initialize chat system if it doesn't exist
        if (!window.chatSystem) {
            console.log('Initializing new chat system...');
            window.chatSystem = new ChatSystem();
        }

        console.log('Starting chat with designer...');
        // Start chat with the specific designer
        window.chatSystem.startChatWithDesigner(designerUserId, designerName, shoeId);
    }

    // Cart navigation function
    window.goToCart = function() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            Swal.fire({
                title: 'Login Required',
                text: 'Vui lòng đăng nhập để xem giỏ hàng!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập',
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'Login.html';
                }
            });
            return;
        }
        
        window.location.href = 'cart.html';
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    let salesChart = null;

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const applyFilterBtn = document.getElementById('apply-filter');

    function formatCurrency(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return '0 ₫';
        }
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    async function fetchRevenueData(startDate, endDate) {
        let url = '/api/DesignerDashboard/view_revenue';

        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        url += '?' + params.toString();

        try {
            const response = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
            if (!response.ok) {
                throw new Error('Lỗi mạng hoặc server.');
            }
            const data = await response.json();
            updateDashboard(data);
        } catch (error) {
            console.error('Lỗi khi tải doanh thu:', error);
            document.getElementById('sales-table-body').innerHTML = '<tr><td colspan="4">Có lỗi xảy ra khi tải dữ liệu.</td></tr>';
            Swal.fire('Lỗi', 'Không thể tải dữ liệu doanh thu. Vui lòng thử lại.', 'error');
        }
    }

    function updateDashboard(data) {
        updateSummary(data);
        updateTable(data);
        updateChart(data);
    }

    function updateSummary(data) {
        // SỬA LẠI TÊN THUỘC TÍNH (chữ hoa đầu)
        const totalRevenue = data.reduce((sum, item) => sum + (item.pricePerShoe * item.quantitySold), 0);
        const totalSales = data.reduce((sum, item) => sum + item.quantitySold, 0);
        const avgPrice = totalSales > 0 ? totalRevenue / totalSales : 0;

        let topProduct = '-';
        if (data.length > 0) {
            const productSales = {};
            data.forEach(item => {
                // SỬA LẠI TÊN THUỘC TÍNH (chữ hoa đầu)
                productSales[item.shoeName] = (productSales[item.shoeName] || 0) + item.quantitySold;
            });
            topProduct = Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b);
        }

        document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('total-sales').textContent = totalSales;
        document.getElementById('avg-price').textContent = formatCurrency(avgPrice);
        document.getElementById('top-product').textContent = topProduct;
    }

    function updateTable(data) {
        const tbody = document.getElementById('sales-table-body');
        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Không có dữ liệu bán hàng cho khoảng thời gian đã chọn.</td></tr>';
            return;
        }
        data.forEach(item => {
            // SỬA LẠI TÊN THUỘC TÍNH (chữ hoa đầu)
            const revenue = item.pricePerShoe * item.quantitySold;
            const row = `
                <tr>
                    <td>${item.shoeName || 'N/A'}</td>
                    <td>${item.quantitySold || 0}</td>
                    <td>${formatCurrency(item.pricePerShoe)}</td>
                    <td>${formatCurrency(revenue)}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    function updateChart(data) {
        const ctx = document.getElementById('sales-chart').getContext('2d');
        const groupedData = {};

        data.forEach(item => {
            // SỬA LẠI TÊN THUỘC TÍNH (chữ hoa đầu)
            groupedData[item.shoeName] = (groupedData[item.shoeName] || 0) + (item.pricePerShoe * item.quantitySold);
        });

        const labels = Object.keys(groupedData);
        const revenues = Object.values(groupedData);

        if (salesChart) {
            salesChart.destroy();
        }

        salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh Thu (VND)',
                    data: revenues,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) { return formatCurrency(value); }
                        }
                    }
                }
            }
        });
    }

    applyFilterBtn.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        if (startDate && endDate) {
            fetchRevenueData(startDate, endDate);
        } else {
            Swal.fire('Thông báo', 'Vui lòng chọn cả ngày bắt đầu và kết thúc.', 'info');
        }
    });

    const today = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
    startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    endDateInput.value = today.toISOString().split('T')[0];
    fetchRevenueData(startDateInput.value, endDateInput.value);
});
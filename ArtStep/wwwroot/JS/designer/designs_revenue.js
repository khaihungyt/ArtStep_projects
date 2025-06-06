document.addEventListener('DOMContentLoaded', function () {
    // Initialize sidebar
    initializeSidebar();

    // Set default dates (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    document.getElementById('start-date').valueAsDate = startDate;
    document.getElementById('end-date').valueAsDate = endDate;

    // View toggle buttons
    document.getElementById('view-summary').addEventListener('click', function () {
        document.getElementById('summary-view').style.display = 'block';
        document.getElementById('chart-view').style.display = 'none';
        this.classList.add('active');
        document.getElementById('view-chart').classList.remove('active');
    });

    document.getElementById('view-chart').addEventListener('click', function () {
        document.getElementById('summary-view').style.display = 'none';
        document.getElementById('chart-view').style.display = 'block';
        this.classList.add('active');
        document.getElementById('view-summary').classList.remove('active');
        renderChart(); // Ensure chart is rendered when switching to chart view
    });

    // Apply filter button
    document.getElementById('apply-filter').addEventListener('click', function () {
        loadSalesData();
    });

    // Initial load of data
    loadSalesData();
});

// Mock data - in a real app, this would come from an API
function fetchSalesData(startDate, endDate) {
    // Simulate API call delay
    return new Promise(resolve => {
        setTimeout(() => {
            // Sample data structure
            const data = {
                summary: {
                    totalRevenue: 5840.50,
                    totalSales: 42,
                    avgPrice: 139.06,
                    topProduct: "Urban Runner Pro"
                },
                products: [
                    {
                        id: 1,
                        name: "Urban Runner Pro",
                        quantitySold: 15,
                        price: 149.99,
                        profitMargin: 0.35
                    },
                    {
                        id: 2,
                        name: "Classic Canvas Sneaker",
                        quantitySold: 12,
                        price: 79.99,
                        profitMargin: 0.25
                    },
                    {
                        id: 3,
                        name: "Performance Trail Shoe",
                        quantitySold: 8,
                        price: 129.99,
                        profitMargin: 0.30
                    },
                    {
                        id: 4,
                        name: "Minimalist Walking Shoe",
                        quantitySold: 7,
                        price: 89.99,
                        profitMargin: 0.28
                    }
                ]
            };

            // Filter by date range in a real app
            resolve(data);
        }, 500);
    });
}

async function loadSalesData() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // Show loading state
    const tableBody = document.getElementById('sales-table-body');
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Loading data...</td></tr>';

    try {
        const data = await fetchSalesData(startDate, endDate);

        // Update summary stats
        document.getElementById('total-revenue').textContent = `$${data.summary.totalRevenue.toFixed(2)}`;
        document.getElementById('total-sales').textContent = data.summary.totalSales;
        document.getElementById('avg-price').textContent = `$${data.summary.avgPrice.toFixed(2)}`;
        document.getElementById('top-product').textContent = data.summary.topProduct;

        // Populate table
        tableBody.innerHTML = '';
        data.products.forEach(product => {
            const totalRevenue = product.quantitySold * product.price;
            const profitPercentage = (product.profitMargin * 100).toFixed(1);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.quantitySold}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td class="highlight">$${totalRevenue.toFixed(2)}</td>
                <td>${profitPercentage}%</td>
            `;
            tableBody.appendChild(row);
        });

        // Update chart if it's visible
        if (document.getElementById('chart-view').style.display !== 'none') {
            renderChart(data);
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading data. Please try again.</td></tr>';
        console.error('Error loading sales data:', error);
    }
}

let salesChart = null;

function renderChart(data) {
    const ctx = document.getElementById('sales-chart').getContext('2d');

    // Destroy previous chart if it exists
    if (salesChart) {
        salesChart.destroy();
    }

    // Sample data - in a real app, use the data parameter
    const chartData = {
        labels: ["Urban Runner Pro", "Classic Canvas Sneaker", "Performance Trail Shoe", "Minimalist Walking Shoe"],
        datasets: [{
            label: 'Revenue by Product',
            data: [2249.85, 959.88, 1039.92, 629.93],
            backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 206, 86, 0.6)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
        }]
    };

    salesChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return '$' + context.raw.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Initialize sidebar functionality (same as your original)
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');

    toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('collapsed');
        const icon = this.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        } else {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        }
    });
}
document.addEventListener('DOMContentLoaded', function() {
    // This file is for any dashboard-specific functionality
    // For now, it's mostly placeholder for future features
    console.log('Element:123123v ', document.getElementById('logout-btn'));

    document.getElementById('logout-btn').addEventListener("click", function (e) {
            e.preventDefault();
            // Xử lý khi người dùng click vào nút Sign Out
            console.log("Sign Out button clicked");
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            window.location.reload();
        });

    // Example: Chart data visualization could be added here
    console.log('Dashboard loaded1232132v ');
    
    // Example: Fetch latest stats from an API
    function fetchDashboardStats() {
        // In a real app, this would be an API call
        // For demo, we'll use the static data already in the HTML
        console.log('Fetched dashboard stats');
    }
    
    // Example: Refresh data periodically
    function setupAutoRefresh() {
        // Refresh dashboard data every 5 minutes
        setInterval(fetchDashboardStats, 5 * 60 * 1000);
    }
    
    // Initialize dashboard
    fetchDashboardStats();
    setupAutoRefresh();
});
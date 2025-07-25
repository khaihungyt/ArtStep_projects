$(document).ready(function () {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " năm trước";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " tháng trước";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " ngày trước";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " giờ trước";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " phút trước";
        return Math.floor(seconds) + " giây trước";
    }

    fetch('/api/DesignerDashboard/summary', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(async res => {
            if (!res.ok) {
                let errorMsg = 'Không thể tải dữ liệu dashboard.';
                if (res.status === 401) errorMsg = 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
                if (res.status === 403) errorMsg = 'Tài khoản của bạn không có quyền truy cập (không phải vai trò designer).';
                if (res.status === 404) errorMsg = 'Không tìm thấy API endpoint. Bạn đã chạy lại server backend chưa?';
                if (res.status === 500) {
                    const err = await res.json();
                    errorMsg = 'Lỗi từ server: ' + (err.message || 'Lỗi không xác định.');
                }
                throw new Error(errorMsg);
            }
            return res.json();
        })
        .then(data => {
            $('#total-designs-value').text(data.totalDesigns);
            $('#total-orders-value').text(data.totalOrders);
            $('#avg-rating-value').text(data.averageRating);

            const popularList = $('#popular-designs-list').empty();
            if (data.popularDesigns && data.popularDesigns.length > 0) {
                data.popularDesigns.forEach(design => {
                    const item = `<div class="design-item"><div><p class="design-name">${design.Name}</p><p class="design-orders">${design.Orders} orders</p></div></div>`;
                    popularList.append(item);
                });
            } else {
                popularList.append('<p>Chưa có dữ liệu.</p>');
            }

            const activityList = $('#activity-list').empty();
            if (data.recentActivity && data.recentActivity.length > 0) {
                data.recentActivity.forEach(activity => {
                    const item = `<div class="activity-item"><p class="activity-text">${activity.Text}</p><p class="activity-time">${timeAgo(activity.Time)}</p></div>`;
                    activityList.append(item);
                });
            } else {
                activityList.append('<p>Chưa có hoạt động nào.</p>');
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu dashboard:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops... Đã có lỗi xảy ra!',
                text: error.message,
            });
        });
});
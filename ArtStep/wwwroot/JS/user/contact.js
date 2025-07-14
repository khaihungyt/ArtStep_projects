// contactForm.js

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contact');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Hiển thị toast loading
            showToast('Đang gửi tin nhắn...', 'info');

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Call API to submit the contact form
            submitContactForm(formData);
        });
    }
});

async function submitContactForm(formData) {
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            showToast('Tin nhắn đã được gửi thành công!', 'success');
            document.getElementById('contact').reset();
        } else {
            const error = await response.json();
            showToast(`Lỗi: ${error.message || 'Có lỗi xảy ra khi gửi tin nhắn'}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Có lỗi xảy ra khi kết nối đến máy chủ', 'error');
    }
}

function showToast(message, type = 'info') {
    let backgroundColor = '#3498db'; // Mặc định màu xanh dương (info)

    switch (type) {
        case 'success':
            backgroundColor = '#2ecc71';
            break;
        case 'error':
            backgroundColor = '#e74c3c';
            break;
        case 'warning':
            backgroundColor = '#f39c12';
            break;
    }

    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top", // top hoặc bottom
        position: "right", // left, center hoặc right
        backgroundColor: backgroundColor,
        stopOnFocus: true, // Dừng tự động đóng khi hover
    }).showToast();
}
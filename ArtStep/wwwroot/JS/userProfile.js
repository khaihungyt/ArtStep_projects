// File: userProfile.js

document.addEventListener('DOMContentLoaded', () => {
    const generalForm = document.getElementById('generalForm');
    const profileTab = document.getElementById('account-general');

    const avatarPreview = profileTab.querySelector('#avatarPreview');
    const avatarInput = profileTab.querySelector('#avatarInput');
    const fullNameInput = profileTab.querySelector('#fullName');
    const emailInput = profileTab.querySelector('#email');
    const phoneInput = profileTab.querySelector('#phoneNo');
    const roleInput = profileTab.querySelector('#role');
    const isActiveChk = profileTab.querySelector('#isActive');
    
    // Hàm load profile
    async function loadProfile() {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.warn('Chưa có token. Vui lòng đăng nhập trước khi load profile.');
                return;
            }

            const res = await fetch('https://localhost:5155/api/Profile/GetProfile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();

            if (res.ok) {
                if (data.imageProfile) {
                    avatarPreview.src = data.imageProfile;
                }

                fullNameInput.value = data.name || '';
                emailInput.value = data.email || '';
                phoneInput.value = data.phoneNo || '';
                roleInput.value = data.role || '';
                isActiveChk.checked = data.isActive === true;
            } else {
                toastr.error(data.message || 'Không thể load thông tin người dùng.');
            }
        } catch (err) {
            toastr.error('Lỗi khi lấy thông tin profile.');
            console.error(err);
        }
    }

    loadProfile();

    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Submit form UpdateProfile
    generalForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        if (avatarInput.files[0]) {
            formData.append('avatar', avatarInput.files[0]);
        }
        formData.append('name', fullNameInput.value.trim());
        formData.append('email', emailInput.value.trim());
        formData.append('phoneNo', phoneInput.value.trim());

        try {
            const res = await fetch('https://localhost:5155/api/Profile/UpdateProfile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                toastr.success(data.message || 'Cập nhật thông tin thành công!');
                loadProfile();
            } else {
                toastr.error(data.message || 'Đã có lỗi khi cập nhật thông tin.');
            }
        } catch (err) {
            toastr.error('Lỗi khi gửi yêu cầu cập nhật.');
            console.error(err);
        }
    });
});

// Change password:
const changePwdForm = document.querySelector('#account-change-password form');

changePwdForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.querySelector('#currentPassword').value.trim();
    const newPassword = document.querySelector('#newPassword').value.trim();
    const confirmPassword = document.querySelector('#confirmPassword').value.trim();

    if (newPassword !== confirmPassword) {
        toastr.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
        return;
    }

    const payload = {
        currentPassword: currentPassword,
        newPassword: newPassword
    };

    try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/Profile/ChangePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            toastr.success(data.message || 'Đổi mật khẩu thành công!');
            document.querySelector('#currentPassword').value = '';
            document.querySelector('#newPassword').value = '';
            document.querySelector('#confirmPassword').value = '';
        } else {
            toastr.error(data.message || 'Đổi mật khẩu thất bại.');
        }
    } catch (err) {
        toastr.error('Lỗi khi gửi yêu cầu đổi mật khẩu.');
        console.error(err);
    }

});

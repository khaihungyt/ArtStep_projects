document.addEventListener('DOMContentLoaded', function () {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(`${this.dataset.tab}-tab`).classList.add('active');
        });
    });
    
    // Avatar upload functionality
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarImg = document.getElementById('profile-avatar-img');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    
    changeAvatarBtn.addEventListener('click', function () {
        avatarUpload.click();
    });
    
    avatarUpload.addEventListener('change', function (e) {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function (event) {
            avatarImg.src = event.target.result;
        };
        
        reader.readAsDataURL(file);
    });
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    
    profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            displayName: document.getElementById('display-name').value,
            name: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };
        
        // In a real app, you would send this data to your backend
        console.log('Profile data:', formData);
        
        // Show success message
        alert('Profile updated successfully!');
    });
    
    // Account form submission
    const accountForm = document.getElementById('account-form');
    
    accountForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
            username: document.getElementById('username').value,
                currentPassword: document.getElementById('current-password').value,
                newPassword: document.getElementById('new-password').value,
                confirmPassword: document.getElementById('confirm-password').value
            };
            
            // Validate passwords
            if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
                alert('New password and confirm password do not match.');
                return;
            }
            
            // In a real app, you would send this data to your backend
            console.log('Account data:', formData);
            
            // Show success message
            alert('Account settings updated successfully!');
        });
    }
});
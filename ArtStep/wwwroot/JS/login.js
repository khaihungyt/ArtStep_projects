﻿(function ($) {
    "use strict";

    $(document).ready(function () {
        // Remove the localStorage.clear() call as it's clearing the token
        const token = localStorage.getItem('token');
        if (token) {
            // If token exists, redirect based on role
            const role = localStorage.getItem('role') || 'user';
            const redirectMap = {
                admin: '/admin/dashboard',
                user: '/user/home',
                designer: '/designer/workspace'
            };
            const redirectUrl = redirectMap[role] || '/home';
            window.location.replace(redirectUrl);
        }
    });

    /*==================================================================
    [ Validate + Submit ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', async function (e) {
        e.preventDefault();

        var check = true;
        for (var i = 0; i < input.length; i++) {
            if (!validate(input[i])) {
                showValidate(input[i]);
                check = false;
            }
        }

        if (!check) return;

        const username = $(this).find('input[name="username"]').val().trim();
        const password = $(this).find('input[name="pass"]').val().trim();

        try {
            const response = await fetch('https://localhost:5155/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ UserName: username, Password: password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                toastr.error(errorData.message || 'Đăng nhập thất bại');
                return;
            }

            const data = await response.json();
            
            // Store token and user data in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user?.role?.toLowerCase() || 'user');
            localStorage.setItem('username', data.user?.name || '');
            localStorage.setItem('userId', data.user?.userId || '');

            toastr.success('Đăng nhập thành công!');

            const role = data.user?.role?.toLowerCase() || 'user';
            const redirectMap = {
                admin: '/admin/dashboard',
                user: '/user/home',
                designer: '/designer/workspace'
            };

            const redirectUrl = redirectMap[role] || '/home';

            setTimeout(() => {
                window.location.replace(redirectUrl);
            }, 1000);

        } catch (error) {
            toastr.error('Lỗi kết nối, vui lòng thử lại sau');
            console.error(error);
        }
    });

    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).val().trim() === '') {
            return false;
        }
        return true;
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).removeClass('alert-validate');
    }

})(jQuery);

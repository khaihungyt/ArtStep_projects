form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        toastr.error("Passwords do not match!");
        return;
    }

    const formData = new FormData(form);

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            toastr.success(result.message || "Registration successful!");
            form.reset();
        } else {
            toastr.error(result.message || "Registration failed.");
        }
    } catch (error) {
        console.error(error);
        toastr.error("An error occurred during registration.");
    }
});

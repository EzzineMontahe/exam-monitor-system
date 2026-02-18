// auth.js - Authentication module (Week 1)

/**
 * Handle login form submission.
 * 1. Validate inputs
 * 2. Call login() from api.js
 * 3. Verify role === 'instructor'
 * 4. Store JWT + role in localStorage
 * 5. Redirect to dashboard.html
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');

    // If already logged in as instructor with valid token, go straight to dashboard
    const existingToken = localStorage.getItem('access_token');
    if (existingToken && localStorage.getItem('role') === 'instructor' && !isTokenExpired(existingToken)) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Client-side validation
        if (!username || !password) {
            showError('Please enter both username and password.');
            return;
        }

        // Disable button to prevent double-submit
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        try {
            // Call API (api.js must be loaded before auth.js)
            const data = await login(username, password);

            // Verify role — only instructors can access the dashboard
            if (data.role !== 'instructor') {
                showError('Access denied. Students must use the desktop application.');
                return;
            }

            // Store JWT and role in localStorage
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('role', data.role);

            // Redirect to dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            // Provide user-friendly message based on error type
            const message = error.message || 'Login failed. Please try again.';
            showError(message);
            console.error('Login error:', error);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.hidden = false;
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.hidden = true;
    }
});

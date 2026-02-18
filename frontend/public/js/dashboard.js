// dashboard.js - Dashboard module (Week 1+)

/**
 * Route Guard:
 * 1. Check localStorage for access_token
 * 2. Check role === 'instructor'
 * 3. If either missing/invalid → redirect to login.html
 * 4. Wire logout button
 */
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');

    // GUARD: Block access if no JWT, wrong role, or expired token
    if (!token || role !== 'instructor' || isTokenExpired(token)) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        window.location.href = 'login.html';
        return;
    }

    // Display user info
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.textContent = `Role: ${role}`;
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
});

/**
 * Logout: clear stored credentials and redirect to login.
 */
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
}

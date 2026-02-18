const API_BASE_URL = 'http://localhost:8000';

/**
 * Test backend connectivity via /health endpoint
 * @returns {Promise<boolean>}
 */
async function testBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('Backend connected:', data);
        return true;
    } catch (error) {
        console.error('Backend connection failed:', error);
        return false;
    }
}

/**
 * Login via POST /auth/login
 * API CONTRACT: Request  { username, password }
 *               Response { access_token, token_type, role }
 *               Error    401 -> Invalid credentials
 * 
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{access_token: string, token_type: string, role: string}>}
 * @throws {Error} on invalid credentials or network failure
 */
async function login(username, password) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
    } catch (networkError) {
        // Network failure: backend down, no internet, CORS blocked
        throw new Error('Unable to connect to server. Please check if the backend is running.');
    }

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid username or password.');
        }
        if (response.status === 403) {
            throw new Error('Access forbidden.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
    }

    const data = await response.json();

    // Validate response shape matches API CONTRACT
    if (!data.access_token || !data.role) {
        throw new Error('Unexpected server response. Please contact support.');
    }

    return data;
}

/**
 * Check if a JWT token is expired by decoding its payload.
 * @param {string} token - JWT token string
 * @returns {boolean} true if expired or malformed
 */
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true; // malformed token = treat as expired
    }
}

// Test backend connection on load
testBackendConnection();

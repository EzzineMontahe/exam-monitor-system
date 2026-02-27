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
        throw new Error(errorData.detail || errorData.error || `Server error (${response.status})`);
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

/**
 * Derive the WebSocket URL from API_BASE_URL.
 * Converts http(s):// → ws(s):// and appends /ws?token=...
 * API CONTRACT §6: ws://localhost:8000/ws?token=JWT_TOKEN
 *
 * @param {string} token - JWT access token
 * @returns {string} full WebSocket URL
 */
function getWebSocketURL(token) {
    const wsBase = API_BASE_URL
        .replace(/^http:/, 'ws:')
        .replace(/^https:/, 'wss:');
    return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
}

// ─── AUTHENTICATED FETCH (Week 3) ───────────────────────────

/**
 * Generic authenticated fetch wrapper.
 * - Injects Authorization: Bearer header
 * - Checks token expiry before request
 * - Handles 401 → calls onAuthFailure (defaults to redirect)
 *
 * @param {string} endpoint - path relative to API_BASE_URL (e.g. '/monitoring/events')
 * @param {object} [options] - fetch options (method, body, etc.)
 * @param {object} [config]
 * @param {function} [config.onAuthFailure] - called on 401/expired token
 * @returns {Promise<any>} parsed JSON response
 * @throws {Error} on network or server errors
 */
async function fetchWithAuth(endpoint, options = {}, { onAuthFailure = null } = {}) {
    const token = localStorage.getItem('access_token');

    // Pre-flight: check token exists and is not expired
    if (!token || isTokenExpired(token)) {
        if (onAuthFailure) onAuthFailure();
        throw new Error('Session expired. Please log in again.');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Authorization': `Bearer ${token}`,
        // Only set Content-Type for requests with a body to avoid unnecessary CORS preflight (C2)
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
    };

    let response;
    try {
        response = await fetch(url, { ...options, headers });
    } catch (networkError) {
        throw new Error('Unable to connect to server.');
    }

    // Handle auth failure
    if (response.status === 401) {
        if (onAuthFailure) onAuthFailure();
        throw new Error('Session expired. Please log in again.');
    }

    if (response.status === 403) {
        throw new Error('Access forbidden. Instructor role required.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `Server error (${response.status})`);
    }

    return response.json();
}

/**
 * Fetch monitoring events for a specific student.
 * API CONTRACT §3: GET /monitoring/events?student_id={id}
 *
 * @param {number} studentId
 * @param {object} [config]
 * @param {function} [config.onAuthFailure]
 * @returns {Promise<Array<{id, student_id, event_type, application_name, window_title, timestamp, screenshot_id, risk_score}>>}
 */
async function fetchMonitoringEvents(studentId, { onAuthFailure = null } = {}) {
    return fetchWithAuth(
        `/monitoring/events?student_id=${encodeURIComponent(studentId)}`,
        { method: 'GET' },
        { onAuthFailure }
    );
}

// ─── BLACKLIST API (Week 4) ─────────────────────────────────

/**
 * Fetch all blacklist items.
 * HANDOFF §2: GET /blacklist → [{id, name, type}]
 *
 * @param {object} [config]
 * @param {function} [config.onAuthFailure]
 * @returns {Promise<Array<{id: number, name: string, type: string}>>}
 */
async function fetchBlacklist({ onAuthFailure = null } = {}) {
    return fetchWithAuth('/blacklist', { method: 'GET' }, { onAuthFailure });
}

/**
 * Add a blacklist item.
 * HANDOFF §2: POST /blacklist {name, type} → {message}
 * Errors: 409 duplicate, 403 not instructor
 *
 * @param {string} name - e.g. "chrome.exe"
 * @param {string} type - "APPLICATION" or "WEBSITE"
 * @param {object} [config]
 * @param {function} [config.onAuthFailure]
 * @returns {Promise<{message: string}>}
 */
async function addBlacklistItem(name, type, { onAuthFailure = null } = {}) {
    return fetchWithAuth(
        '/blacklist',
        { method: 'POST', body: JSON.stringify({ name, type }) },
        { onAuthFailure }
    );
}

/**
 * Delete a blacklist item.
 * HANDOFF §2: DELETE /blacklist/{item_id} → {message}
 * Errors: 404 not found, 403 not instructor
 *
 * @param {number} itemId
 * @param {object} [config]
 * @param {function} [config.onAuthFailure]
 * @returns {Promise<{message: string}>}
 */
async function deleteBlacklistItem(itemId, { onAuthFailure = null } = {}) {
    return fetchWithAuth(
        `/blacklist/${encodeURIComponent(itemId)}`,
        { method: 'DELETE' },
        { onAuthFailure }
    );
}

// ─── RISK SCORES API (Week 5) ───────────────────────────────

/**
 * Fetch risk scores for all students.
 * HANDOFF §4: GET /monitoring/risk-scores
 *
 * @param {object} [config]
 * @param {function} [config.onAuthFailure]
 * @returns {Promise<Array<{student_id, username, risk_score, risk_level, violation_count, window_switch_count, suspicious_window_count, last_updated}>>}
 */
async function fetchRiskScores({ onAuthFailure = null } = {}) {
    return fetchWithAuth('/monitoring/risk-scores', { method: 'GET' }, { onAuthFailure });
}

/**
 * Fetch risk score for a specific student.
 * HANDOFF §4: GET /monitoring/risk-scores/{student_id}
 *
 * @param {number} studentId
 * @param {object} [config]
 * @param {function} [config.onAuthFailure]
 * @returns {Promise<object>}
 */
async function fetchStudentRiskScore(studentId, { onAuthFailure = null } = {}) {
    return fetchWithAuth(
        `/monitoring/risk-scores/${encodeURIComponent(studentId)}`,
        { method: 'GET' },
        { onAuthFailure }
    );
}

// ─── SCREENSHOTS API (Week 5) ───────────────────────────────

/**
 * Fetch screenshot metadata.
 * HANDOFF §5: GET /screenshots/{screenshot_id}
 *
 * @param {number} screenshotId
 * @param {object} [config]
 * @param {function} [config.onAuthFailure]
 * @returns {Promise<{id, student_id, event_id, trigger_type, file_url, captured_at, thumbnail_url}>}
 */
async function fetchScreenshotMeta(screenshotId, { onAuthFailure = null } = {}) {
    return fetchWithAuth(
        `/screenshots/${encodeURIComponent(screenshotId)}`,
        { method: 'GET' },
        { onAuthFailure }
    );
}

/**
 * Get the full URL for downloading a screenshot.
 * HANDOFF §5: GET /screenshots/download/{screenshot_id} → binary JPEG
 * @param {number} screenshotId
 * @returns {string}
 */
function getScreenshotDownloadURL(screenshotId) {
    return `${API_BASE_URL}/screenshots/download/${screenshotId}`;
}

/**
 * Get the full URL for a screenshot thumbnail.
 * HANDOFF §5: GET /screenshots/thumbnail/{screenshot_id} → binary JPEG
 * @param {number} screenshotId
 * @returns {string}
 */
function getScreenshotThumbnailURL(screenshotId) {
    return `${API_BASE_URL}/screenshots/thumbnail/${screenshotId}`;
}

/**
 * Fetch all screenshots for a student.
 * HANDOFF §5: GET /screenshots/student/{student_id}
 *
 * @param {number} studentId
 * @param {object} [config]
 * @param {function} [config.onAuthFailure]
 * @returns {Promise<Array<{id, event_id, trigger_type, file_url, captured_at, thumbnail_url}>>}
 */
async function fetchStudentScreenshots(studentId, { onAuthFailure = null } = {}) {
    return fetchWithAuth(
        `/screenshots/student/${encodeURIComponent(studentId)}`,
        { method: 'GET' },
        { onAuthFailure }
    );
}

/**
 * Request a manual screenshot from a student.
 * HANDOFF §5: POST /screenshots/request {student_id} → {message, request_id}
 * Errors: 400 student not connected, 403 not instructor, 429 rate limit
 *
 * @param {number} studentId
 * @param {object} [config]
 * @param {function} [config.onAuthFailure]
 * @returns {Promise<{message: string, request_id: string}>}
 */
async function requestScreenshot(studentId, { onAuthFailure = null } = {}) {
    return fetchWithAuth(
        '/screenshots/request',
        { method: 'POST', body: JSON.stringify({ student_id: studentId }) },
        { onAuthFailure }
    );
}

/**
 * Fetch an authenticated image as a blob URL (for thumbnails/full screenshots).
 * Uses Authorization header so JWT is not exposed in the URL.
 *
 * @param {string} url - full URL to the image endpoint
 * @param {object} [config]
 * @param {function} [config.onAuthFailure]
 * @returns {Promise<string>} object URL for the image blob
 */
async function fetchImageAsBlob(url, { onAuthFailure = null } = {}) {
    const token = localStorage.getItem('access_token');
    if (!token || isTokenExpired(token)) {
        if (onAuthFailure) onAuthFailure();
        throw new Error('Session expired. Please log in again.');
    }

    let response;
    try {
        response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (networkError) {
        throw new Error('Unable to connect to server.');
    }

    if (response.status === 401) {
        if (onAuthFailure) onAuthFailure();
        throw new Error('Session expired. Please log in again.');
    }
    if (!response.ok) {
        throw new Error(`Failed to load image (${response.status})`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// Test backend connection on load
testBackendConnection();

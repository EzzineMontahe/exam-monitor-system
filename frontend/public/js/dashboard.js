// dashboard.js - Dashboard module (Week 1 + Week 2 + Week 3: Violations)

// ─── GLOBAL STATE ────────────────────────────────────────────
/** @type {ExamWebSocket|null} */
let examWs = null;

/** Connected students: Map<student_id, { student_id, username, status, last_seen }> */
const connectedStudents = new Map();

/** Live violations list (newest first, capped at MAX_VIOLATIONS) */
const violations = [];
const MAX_VIOLATIONS = 100;

/** Toast cap — max visible toasts at once (I4) */
const MAX_TOASTS = 5;

/** History request counter to discard stale responses (I2) */
let historyRequestId = 0;

// ─── DOM REFERENCES (set after DOMContentLoaded) ─────────────
let wsStatusEl, wsLabelEl, studentCountEl, studentTableEl, studentTableBodyEl, studentListEmptyEl;
let violationCountEl, violationsTableEl, violationsTableBodyEl, violationsEmptyEl;
let historySectionEl, historyStudentNameEl, historyLoadingEl, historyEmptyEl, historyErrorEl, historyTableEl, historyTableBodyEl;
let toastContainerEl;

/**
 * Route Guard:
 * 1. Check localStorage for access_token
 * 2. Check role === 'instructor'
 * 3. If either missing/invalid → redirect to login.html
 * 4. Wire logout button
 * 5. Initialise WebSocket (Week 2)
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

    // Cache DOM references
    wsStatusEl = document.getElementById('wsStatus');
    wsLabelEl = wsStatusEl ? wsStatusEl.querySelector('.ws-label') : null;
    studentCountEl = document.getElementById('studentCount');
    studentTableEl = document.getElementById('studentTable');
    studentTableBodyEl = document.getElementById('studentTableBody');
    studentListEmptyEl = document.getElementById('studentListEmpty');

    // Week 3 DOM references
    violationCountEl = document.getElementById('violationCount');
    violationsTableEl = document.getElementById('violationsTable');
    violationsTableBodyEl = document.getElementById('violationsTableBody');
    violationsEmptyEl = document.getElementById('violationsEmpty');
    historySectionEl = document.getElementById('historySection');
    historyStudentNameEl = document.getElementById('historyStudentName');
    historyLoadingEl = document.getElementById('historyLoading');
    historyEmptyEl = document.getElementById('historyEmpty');
    historyErrorEl = document.getElementById('historyError');
    historyTableEl = document.getElementById('historyTable');
    historyTableBodyEl = document.getElementById('historyTableBody');
    toastContainerEl = document.getElementById('toastContainer');

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

    // ── Week 3: Wire history close button once (M1) ──
    const historyCloseBtn = document.getElementById('historyCloseBtn');
    if (historyCloseBtn) {
        historyCloseBtn.addEventListener('click', () => {
            if (historySectionEl) historySectionEl.hidden = true;
        });
    }

    // ── Week 3: Event delegation for student rows (C1 + M4) ──
    // Single listener instead of re-attaching on every render
    if (studentTableBodyEl) {
        const handleStudentRowAction = (row) => {
            const studentId = Number(row.dataset.studentId);
            const studentName = row.dataset.studentName;
            loadViolationHistory(studentId, studentName);
        };

        studentTableBodyEl.addEventListener('click', (e) => {
            const row = e.target.closest('.student-row');
            if (row) handleStudentRowAction(row);
        });

        studentTableBodyEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const row = e.target.closest('.student-row');
                if (row) {
                    e.preventDefault();
                    handleStudentRowAction(row);
                }
            }
        });
    }

    // ── Week 2: Initialise WebSocket ──
    initWebSocket(token);
});

// ─── WEBSOCKET INITIALISATION ────────────────────────────────

/**
 * Create ExamWebSocket, register handlers, and connect.
 * @param {string} token
 */
function initWebSocket(token) {
    examWs = new ExamWebSocket(token, { onAuthFailure: logout, debug: false });

    // Update UI on connection state changes
    examWs.onStateChange((state) => {
        updateWsStatusIndicator(state);

        // Clear stale student data on fresh reconnect (I4)
        if (state === 'connected' && connectedStudents.size > 0) {
            connectedStudents.clear();
            renderStudentList();
        }

        // Mark student list as potentially stale when disconnected (I1)
        if (state === 'disconnected' || state === 'reconnecting') {
            markStudentsStale();
        }
    });

    // ── Message Handlers (API CONTRACT §6.2) ──

    // STUDENT_STATUS — student connected / disconnected
    examWs.on('STUDENT_STATUS', (data) => {
        handleStudentStatus(data);
    });

    // NEW_VIOLATION — real-time violation alert (Week 3)
    examWs.on('NEW_VIOLATION', (data) => {
        handleNewViolation(data);
    });

    // Connect
    examWs.connect();
}

// ─── STUDENT LIST MANAGEMENT ─────────────────────────────────

/**
 * Handle STUDENT_STATUS message.
 * API CONTRACT §6.2:
 * { student_id, username, status: "ONLINE"|"OFFLINE", last_seen }
 *
 * @param {object} data
 */
function handleStudentStatus(data) {
    if (!data || !data.student_id) {
        console.warn('[Dashboard] Invalid STUDENT_STATUS data:', data);
        return;
    }

    // Normalize student_id to Number to prevent Map key type mismatch (C2)
    const id = Number(data.student_id);

    if (data.status === 'ONLINE') {
        connectedStudents.set(id, {
            student_id: id,
            username: data.username || `Student ${id}`,
            status: 'ONLINE',
            last_seen: data.last_seen || new Date().toISOString()
        });
    } else if (data.status === 'OFFLINE') {
        // Keep in list but mark offline (so instructor sees who disconnected)
        const existing = connectedStudents.get(id);
        if (existing) {
            existing.status = 'OFFLINE';
            existing.last_seen = data.last_seen || new Date().toISOString();
        } else {
            connectedStudents.set(id, {
                student_id: id,
                username: data.username || `Student ${id}`,
                status: 'OFFLINE',
                last_seen: data.last_seen || new Date().toISOString()
            });
        }
    }

    renderStudentList();
}

/**
 * Render the student list table from the connectedStudents Map.
 */
function renderStudentList() {
    if (!studentTableBodyEl) return;

    // Update count badge (only ONLINE students)
    const onlineCount = [...connectedStudents.values()].filter(s => s.status === 'ONLINE').length;
    if (studentCountEl) {
        studentCountEl.textContent = onlineCount;
    }

    // Show/hide empty state vs table
    if (connectedStudents.size === 0) {
        studentTableEl.hidden = true;
        studentListEmptyEl.hidden = false;
        return;
    }

    studentTableEl.hidden = false;
    studentListEmptyEl.hidden = true;

    // Sort: online first, stale second, offline last, then by username
    const statusOrder = { ONLINE: 0, STALE: 1, OFFLINE: 2 };
    const sorted = [...connectedStudents.values()].sort((a, b) => {
        const orderA = statusOrder[a.status] ?? 2;
        const orderB = statusOrder[b.status] ?? 2;
        if (orderA !== orderB) return orderA - orderB;
        return a.username.localeCompare(b.username);
    });

    studentTableBodyEl.innerHTML = sorted.map(student => {
        const statusMap = {
            ONLINE:  { css: 'status-online',  label: 'Online'  },
            OFFLINE: { css: 'status-offline', label: 'Offline' },
            STALE:   { css: 'status-stale',  label: 'Stale'   }
        };
        const { css: statusClass, label: statusLabel } = statusMap[student.status] || statusMap.OFFLINE;
        const lastSeen = formatTimestamp(student.last_seen);
        return `
            <tr class="${statusClass} student-row" data-student-id="${student.student_id}" data-student-name="${escapeHtml(student.username)}" role="button" tabindex="0" title="Click to view violation history">
                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                <td>${escapeHtml(student.username)}</td>
                <td>${student.student_id}</td>
                <td>${lastSeen}</td>
            </tr>
        `;
    }).join('');

    // Click/keyboard handlers wired via event delegation in DOMContentLoaded (C1)
}

// ─── WS STATUS INDICATOR ────────────────────────────────────

/**
 * Update the WebSocket connection indicator in the header.
 * @param {'disconnected'|'connecting'|'connected'|'reconnecting'} state
 */
function updateWsStatusIndicator(state) {
    if (!wsStatusEl || !wsLabelEl) return;

    // Remove all state classes
    wsStatusEl.classList.remove('connected', 'connecting', 'reconnecting', 'disconnected');
    wsStatusEl.classList.add(state);

    const labels = {
        connected: 'Live',
        connecting: 'Connecting...',
        reconnecting: 'Reconnecting...',
        disconnected: 'Disconnected'
    };
    wsLabelEl.textContent = labels[state] || state;
    wsStatusEl.title = `WebSocket ${state}`;
}

// ─── VIOLATION MANAGEMENT (Week 3) ──────────────────────────

/**
 * Handle NEW_VIOLATION message from WebSocket.
 * API CONTRACT §6.2:
 * { student_id, username, event_type, application_name, timestamp, screenshot_id, risk_score }
 *
 * @param {object} data
 */
function handleNewViolation(data) {
    if (!data || !data.student_id || !data.event_type) {
        console.warn('[Dashboard] Invalid NEW_VIOLATION data:', data);
        return;
    }

    const violation = {
        student_id: Number(data.student_id),
        username: data.username || `Student ${data.student_id}`,
        event_type: data.event_type,
        application_name: data.application_name || '—',
        timestamp: data.timestamp || new Date().toISOString(),
        screenshot_id: data.screenshot_id || null,
        risk_score: data.risk_score ?? null
    };

    // Prepend (newest first), cap at MAX_VIOLATIONS
    violations.unshift(violation);
    if (violations.length > MAX_VIOLATIONS) {
        violations.length = MAX_VIOLATIONS;
    }

    renderViolations();
    showViolationToast(violation);
    updatePageTitle();
}

/**
 * Render the live violations table.
 */
function renderViolations() {
    if (!violationsTableBodyEl) return;

    // Update count badge
    if (violationCountEl) {
        violationCountEl.textContent = violations.length;
    }

    // Empty state
    if (violations.length === 0) {
        violationsTableEl.hidden = true;
        violationsEmptyEl.hidden = false;
        return;
    }

    violationsTableEl.hidden = false;
    violationsEmptyEl.hidden = true;

    violationsTableBodyEl.innerHTML = violations.map((v, index) => {
        const typeBadge = getViolationTypeBadge(v.event_type);
        const time = formatTimestamp(v.timestamp);
        const isNew = index === 0 ? 'violation-new' : '';
        return `
            <tr class="${isNew}">
                <td>${time}</td>
                <td>${escapeHtml(v.username)}</td>
                <td>${typeBadge}</td>
                <td>${escapeHtml(v.application_name)}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Return an HTML badge for a violation event type.
 * @param {string} eventType
 * @returns {string} HTML string
 */
function getViolationTypeBadge(eventType) {
    const typeMap = {
        'BLACKLIST_APP':        { css: 'vtype-blacklist',   label: 'Blacklisted App' },
        'WINDOW_FOCUS':         { css: 'vtype-window',      label: 'Window Focus' },
        'SUSPICIOUS_BEHAVIOR':  { css: 'vtype-suspicious',  label: 'Suspicious' }
    };
    const info = typeMap[eventType] || { css: 'vtype-unknown', label: escapeHtml(eventType) };
    return `<span class="violation-type-badge ${info.css}">${info.label}</span>`;
}

// ─── VIOLATION HISTORY (Week 3) ─────────────────────────────

/**
 * Fetch and display violation history for a specific student.
 * Uses GET /monitoring/events?student_id={id} (API CONTRACT §3)
 *
 * @param {number} studentId
 * @param {string} studentName
 */
async function loadViolationHistory(studentId, studentName) {
    if (!historySectionEl) return;

    // Increment request counter to detect stale responses (I2)
    const currentRequestId = ++historyRequestId;

    // Show panel, set header
    historySectionEl.hidden = false;
    historyStudentNameEl.textContent = studentName;

    // Reset states
    historyLoadingEl.hidden = false;
    historyEmptyEl.hidden = true;
    historyErrorEl.hidden = true;
    historyTableEl.hidden = true;

    try {
        const events = await fetchMonitoringEvents(studentId, { onAuthFailure: logout });

        // Discard stale response if a newer request was fired (I2)
        if (currentRequestId !== historyRequestId) return;

        historyLoadingEl.hidden = true;

        if (!events || events.length === 0) {
            historyEmptyEl.hidden = false;
            return;
        }

        historyTableEl.hidden = false;
        historyTableBodyEl.innerHTML = events.map(ev => {
            const typeBadge = getViolationTypeBadge(ev.event_type);
            const time = formatTimestamp(ev.timestamp);
            const windowTitle = ev.window_title ? escapeHtml(ev.window_title) : '—';
            const appName = ev.application_name ? escapeHtml(ev.application_name) : '—';
            return `
                <tr>
                    <td>${time}</td>
                    <td>${typeBadge}</td>
                    <td>${appName}</td>
                    <td class="cell-truncate" title="${windowTitle}">${windowTitle}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        // Discard stale error if a newer request was fired (I2)
        if (currentRequestId !== historyRequestId) return;

        console.error('[Dashboard] Failed to load violation history:', err);
        historyLoadingEl.hidden = true;
        historyErrorEl.hidden = false;
        historyErrorEl.textContent = err.message || 'Failed to load history.';
    }
}

// ─── TOAST NOTIFICATIONS (Week 3) ───────────────────────────

/**
 * Show a brief toast notification for a new violation.
 * @param {object} violation
 */
function showViolationToast(violation) {
    if (!toastContainerEl) return;

    // Cap visible toasts (I4) — remove oldest if at limit
    while (toastContainerEl.children.length >= MAX_TOASTS) {
        toastContainerEl.firstElementChild.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast toast-violation';
    toast.innerHTML = `
        <span class="toast-icon">⚠</span>
        <span class="toast-text">
            <strong>${escapeHtml(violation.username)}</strong> — ${escapeHtml(violation.event_type.replace(/_/g, ' '))}
            ${violation.application_name !== '—' ? ': ' + escapeHtml(violation.application_name) : ''}
        </span>
    `;

    toastContainerEl.appendChild(toast);

    // Trigger enter animation on next frame
    requestAnimationFrame(() => { toast.classList.add('toast-visible'); });

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        toast.addEventListener('transitionend', () => toast.remove());
        // Fallback removal after transition
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 500);
    }, 5000);
}

/**
 * Update page title with violation count for tab visibility.
 */
function updatePageTitle() {
    const count = violations.length;
    document.title = count > 0
        ? `(${count}) Exam Monitor - Dashboard`
        : 'Exam Monitor - Dashboard';
}

// ─── UTILITIES ──────────────────────────────────────────────

/**
 * Mark all students as stale when connection is lost (I1).
 * Adds visual indicator that statuses may be outdated.
 */
function markStudentsStale() {
    connectedStudents.forEach(student => {
        if (student.status === 'ONLINE') {
            student.status = 'STALE';
        }
    });
    renderStudentList();
}

/**
 * Format ISO timestamp to a readable short time string.
 * @param {string} isoString
 * @returns {string}
 */
function formatTimestamp(isoString) {
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '—';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
        return '—';
    }
}

/**
 * Escape HTML to prevent XSS in dynamic content.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Logout: close WebSocket, clear stored credentials, redirect to login.
 */
function logout() {
    if (examWs) {
        examWs.disconnect();
        examWs = null;
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
}

// dashboard.js - Dashboard module (Week 1 + Week 2 + Week 3 + Week 4 + Week 5)

// ─── GLOBAL STATE ────────────────────────────────────────────
/** @type {ExamWebSocket|null} */
let examWs = null;

/** Connected students: Map<student_id, { student_id, username, status, last_seen, risk_score, risk_level, ... }> */
const connectedStudents = new Map();

/** Live violations list (newest first, capped at MAX_VIOLATIONS) */
const violations = [];
const MAX_VIOLATIONS = 100;

/** History request counter to discard stale responses */
let historyRequestId = 0;

/** Current violation filter */
let currentViolationFilter = 'ALL';

/** Current violation sort (Week 5) */
let violationSortField = null; // 'risk_score' or 'timestamp'
let violationSortAsc = false;  // default descending

/** Suspicious window alerts (Week 5) */
const suspiciousAlerts = [];
const MAX_ALERTS = 50;

// ─── DOM REFERENCES (set after DOMContentLoaded) ─────────────
let wsStatusEl, wsLabelEl, studentCountEl, studentTableEl, studentTableBodyEl, studentListEmptyEl;
let violationCountEl, violationsTableEl, violationsTableBodyEl, violationsEmptyEl, violationFilterEl;
let historySectionEl, historyStudentNameEl, historyLoadingEl, historyEmptyEl, historyErrorEl, historyTableEl, historyTableBodyEl;
let analyticsSectionEl, analyticsEmptyEl, analyticsContentEl, analyticsTableBodyEl, alertCountEl;
let analyticsSummaryEl, riskDetailSectionEl, riskDetailContentEl, riskDetailLoadingEl, riskDetailNameEl;
let riskDetailErrorEl, riskDetailScoreEl, riskDetailLevelEl, riskDetailViolationsEl;
let riskDetailSwitchesEl, riskDetailSuspiciousEl, riskDetailUpdatedEl;
let riskDetailEventsEl, riskDetailEventsListEl;
let summaryHighRiskEl, summaryTotalViolationsEl, summarySuspiciousWindowsEl;

/** Prevents rapid-fire risk detail requests (A2 debounce) */
let riskDetailBusy = false;

/**
 * Route Guard & Initialisation.
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

    // Cache DOM references — Week 2
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

    // Week 5 DOM references
    violationFilterEl = document.getElementById('violationFilter');
    analyticsSectionEl = document.getElementById('analyticsSection');
    analyticsEmptyEl = document.getElementById('analyticsEmpty');
    analyticsContentEl = document.getElementById('analyticsContent');
    analyticsTableBodyEl = document.getElementById('analyticsTableBody');
    alertCountEl = document.getElementById('alertCount');
    analyticsSummaryEl = document.getElementById('analyticsSummary');
    riskDetailSectionEl = document.getElementById('riskDetailSection');
    riskDetailContentEl = document.getElementById('riskDetailContent');
    riskDetailLoadingEl = document.getElementById('riskDetailLoading');
    riskDetailNameEl = document.getElementById('riskDetailName');
    riskDetailErrorEl = document.getElementById('riskDetailError');
    riskDetailScoreEl = document.getElementById('riskDetailScore');
    riskDetailLevelEl = document.getElementById('riskDetailLevel');
    riskDetailViolationsEl = document.getElementById('riskDetailViolations');
    riskDetailSwitchesEl = document.getElementById('riskDetailSwitches');
    riskDetailSuspiciousEl = document.getElementById('riskDetailSuspicious');
    riskDetailUpdatedEl = document.getElementById('riskDetailUpdated');
    riskDetailEventsEl = document.getElementById('riskDetailEvents');
    riskDetailEventsListEl = document.getElementById('riskDetailEventsList');
    summaryHighRiskEl = document.getElementById('summaryHighRisk');
    summaryTotalViolationsEl = document.getElementById('summaryTotalViolations');
    summarySuspiciousWindowsEl = document.getElementById('summarySuspiciousWindows');

    // Display user info
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.textContent = `Role: ${role}`;
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => { logout(); });
    }

    // ── Week 3: Wire history close button ──
    const historyCloseBtn = document.getElementById('historyCloseBtn');
    if (historyCloseBtn) {
        historyCloseBtn.addEventListener('click', () => {
            if (historySectionEl) historySectionEl.hidden = true;
        });
    }

    // ── Week 5: Wire risk detail close button ──
    const riskDetailCloseBtn = document.getElementById('riskDetailCloseBtn');
    if (riskDetailCloseBtn) {
        riskDetailCloseBtn.addEventListener('click', () => {
            if (riskDetailSectionEl) riskDetailSectionEl.hidden = true;
        });
    }

    // ── Event delegation for student rows (click to view history) ──
    if (studentTableBodyEl) {
        studentTableBodyEl.addEventListener('click', (e) => {
            // Screenshot request button
            const screenshotBtn = e.target.closest('.btn-screenshot');
            if (screenshotBtn) {
                e.stopPropagation();
                const studentId = Number(screenshotBtn.dataset.studentId);
                handleManualScreenshotRequest(studentId, screenshotBtn);
                return;
            }
            // Risk detail button
            const detailBtn = e.target.closest('.btn-risk-detail');
            if (detailBtn) {
                e.stopPropagation();
                const studentId = Number(detailBtn.dataset.studentId);
                const studentName = detailBtn.dataset.studentName;
                loadStudentRiskDetail(studentId, studentName);
                return;
            }
            // Row click → history
            const row = e.target.closest('.student-row');
            if (row) {
                const studentId = Number(row.dataset.studentId);
                const studentName = row.dataset.studentName;
                loadViolationHistory(studentId, studentName);
            }
        });

        studentTableBodyEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const row = e.target.closest('.student-row');
                if (row) {
                    e.preventDefault();
                    const studentId = Number(row.dataset.studentId);
                    const studentName = row.dataset.studentName;
                    loadViolationHistory(studentId, studentName);
                }
            }
        });
    }

    // ── Week 5: Violation filter ──
    if (violationFilterEl) {
        violationFilterEl.addEventListener('change', (e) => {
            currentViolationFilter = e.target.value;
            renderViolations();
        });
    }

    // ── Week 5: Violation sort header ──
    const violationSortRiskEl = document.getElementById('violationSortRisk');
    if (violationSortRiskEl) {
        violationSortRiskEl.addEventListener('click', () => {
            const field = violationSortRiskEl.dataset.sort;
            if (violationSortField === field) {
                violationSortAsc = !violationSortAsc;
            } else {
                violationSortField = field;
                violationSortAsc = false; // default descending for risk
            }
            // Clear previous sort indicators before setting new one (M4 future-proof)
            document.querySelectorAll('.th-sorted').forEach(el => el.classList.remove('th-sorted', 'th-sorted-asc'));
            violationSortRiskEl.classList.add('th-sorted');
            violationSortRiskEl.classList.toggle('th-sorted-asc', violationSortAsc);
            renderViolations();
        });
    }

    // ── Week 5: Event delegation for screenshot indicators in violations/history ──
    document.addEventListener('click', (e) => {
        const indicator = e.target.closest('.screenshot-indicator, .screenshot-thumb');
        if (indicator) {
            const screenshotId = Number(indicator.dataset.screenshotId);
            if (screenshotId) {
                openScreenshotModal(screenshotId);
            }
        }
    });

    // ── Week 4: Initialise blacklist ──
    initBlacklist();

    // ── Week 5: Initialise screenshots module ──
    initScreenshots();

    // ── Week 2: Initialise WebSocket ──
    // (loadInitialRiskScores is called inside handleConnectedStudentsList after WS connect)
    initWebSocket(token);
});

// ─── WEBSOCKET INITIALISATION ────────────────────────────────

/**
 * Create ExamWebSocket, register all handlers, and connect.
 * @param {string} token
 */
function initWebSocket(token) {
    examWs = new ExamWebSocket(token, { onAuthFailure: logout, debug: false });

    // Update UI on connection state changes
    examWs.onStateChange((state) => {
        updateWsStatusIndicator(state);

        // Clear stale student data on fresh reconnect
        if (state === 'connected' && connectedStudents.size > 0) {
            // Don't clear — CONNECTED_STUDENTS_LIST will replace the list
        }

        // Mark student list as potentially stale when disconnected
        if (state === 'disconnected' || state === 'reconnecting') {
            markStudentsStale();
        }
    });

    // ── Message Handlers (HANDOFF §6) ──

    // CONNECTED_STUDENTS_LIST — full list sent on connect (Week 5 handoff)
    examWs.on('CONNECTED_STUDENTS_LIST', (data) => {
        handleConnectedStudentsList(data);
    });

    // STUDENT_STATUS — single student connected / disconnected
    examWs.on('STUDENT_STATUS', (data) => {
        handleStudentStatus(data);
    });

    // NEW_VIOLATION — real-time violation alert (Week 3)
    examWs.on('NEW_VIOLATION', (data) => {
        handleNewViolation(data);
    });

    // RISK_SCORE_UPDATE — real-time risk score change (Week 5)
    examWs.on('RISK_SCORE_UPDATE', (data) => {
        handleRiskScoreUpdate(data);
    });

    // SUSPICIOUS_WINDOW — suspicious window alert (Week 5)
    examWs.on('SUSPICIOUS_WINDOW', (data) => {
        handleSuspiciousWindow(data);
    });

    // SCREENSHOT_AVAILABLE — new screenshot stored (Week 5)
    examWs.on('SCREENSHOT_AVAILABLE', (data) => {
        handleScreenshotAvailable(data);
    });

    // Connect
    examWs.connect();
}

// ─── STUDENT LIST MANAGEMENT ─────────────────────────────────

/**
 * Handle CONNECTED_STUDENTS_LIST — replaces entire student list.
 * HANDOFF §6: [{student_id, username, status, last_seen}]
 * @param {Array} data
 */
function handleConnectedStudentsList(data) {
    if (!Array.isArray(data)) {
        console.warn('[Dashboard] Invalid CONNECTED_STUDENTS_LIST data:', data);
        return;
    }

    connectedStudents.clear();
    data.forEach(student => {
        const id = Number(student.student_id);
        connectedStudents.set(id, {
            student_id: id,
            username: student.username || `Student ${id}`,
            status: student.status || 'ONLINE',
            last_seen: student.last_seen || new Date().toISOString(),
            risk_score: null,
            risk_level: null,
            violation_count: 0,
            window_switch_count: 0,
            suspicious_window_count: 0
        });
    });

    renderStudentList();

    // Refresh risk scores after student list update
    loadInitialRiskScores();
}

/**
 * Handle STUDENT_STATUS message.
 * HANDOFF §6: { student_id, username, status: "ONLINE"|"OFFLINE", last_seen }
 * @param {object} data
 */
function handleStudentStatus(data) {
    if (!data || !data.student_id) {
        console.warn('[Dashboard] Invalid STUDENT_STATUS data:', data);
        return;
    }

    const id = Number(data.student_id);

    if (data.status === 'ONLINE') {
        const existing = connectedStudents.get(id);
        connectedStudents.set(id, {
            student_id: id,
            username: data.username || `Student ${id}`,
            status: 'ONLINE',
            last_seen: data.last_seen || new Date().toISOString(),
            risk_score: existing ? existing.risk_score : null,
            risk_level: existing ? existing.risk_level : null,
            violation_count: existing ? existing.violation_count : 0,
            window_switch_count: existing ? existing.window_switch_count : 0,
            suspicious_window_count: existing ? existing.suspicious_window_count : 0
        });
    } else if (data.status === 'OFFLINE') {
        const existing = connectedStudents.get(id);
        if (existing) {
            existing.status = 'OFFLINE';
            existing.last_seen = data.last_seen || new Date().toISOString();
        } else {
            connectedStudents.set(id, {
                student_id: id,
                username: data.username || `Student ${id}`,
                status: 'OFFLINE',
                last_seen: data.last_seen || new Date().toISOString(),
                risk_score: null,
                risk_level: null,
                violation_count: 0,
                window_switch_count: 0,
                suspicious_window_count: 0
            });
        }
    }

    renderStudentList();
}

// ─── RISK SCORES (Week 5) ───────────────────────────────────

/**
 * Fetch initial risk scores and apply to student list.
 */
async function loadInitialRiskScores() {
    try {
        const scores = await fetchRiskScores({ onAuthFailure: logout });
        if (!Array.isArray(scores)) return;

        scores.forEach(s => {
            const id = Number(s.student_id);
            const existing = connectedStudents.get(id);
            if (existing) {
                existing.risk_score = s.risk_score;
                existing.risk_level = s.risk_level;
                existing.violation_count = s.violation_count ?? 0;
                existing.window_switch_count = s.window_switch_count ?? 0;
                existing.suspicious_window_count = s.suspicious_window_count ?? 0;
            } else {
                // Student has a risk score but may not be connected yet — store it
                connectedStudents.set(id, {
                    student_id: id,
                    username: s.username || `Student ${id}`,
                    status: 'OFFLINE',
                    last_seen: s.last_updated || new Date().toISOString(),
                    risk_score: s.risk_score,
                    risk_level: s.risk_level,
                    violation_count: s.violation_count ?? 0,
                    window_switch_count: s.window_switch_count ?? 0,
                    suspicious_window_count: s.suspicious_window_count ?? 0
                });
            }
        });

        renderStudentList();
    } catch (err) {
        console.error('[Dashboard] Failed to load initial risk scores:', err);
    }
}

/**
 * Handle RISK_SCORE_UPDATE WebSocket message.
 * HANDOFF §6: { student_id, username, risk_score, risk_level, previous_score }
 * @param {object} data
 */
function handleRiskScoreUpdate(data) {
    if (!data || !data.student_id) return;

    const id = Number(data.student_id);
    const existing = connectedStudents.get(id);

    if (existing) {
        existing.risk_score = data.risk_score;
        existing.risk_level = data.risk_level;
    } else {
        connectedStudents.set(id, {
            student_id: id,
            username: data.username || `Student ${id}`,
            status: 'ONLINE',
            last_seen: new Date().toISOString(),
            risk_score: data.risk_score,
            risk_level: data.risk_level,
            violation_count: 0,
            window_switch_count: 0,
            suspicious_window_count: 0
        });
    }

    renderStudentList();
}

// ─── STUDENT RISK DETAIL VIEW (Week 5) ──────────────────────

/**
 * Fetch and display detailed risk information for a specific student.
 * Uses GET /monitoring/risk-scores/{student_id} (API_CONTRACT §4)
 * @param {number} studentId
 * @param {string} studentName
 */
async function loadStudentRiskDetail(studentId, studentName) {
    if (!riskDetailSectionEl) return;
    if (riskDetailBusy) return; // debounce rapid clicks (A2)
    riskDetailBusy = true;

    // Show panel with loading state
    riskDetailSectionEl.hidden = false;
    riskDetailSectionEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (riskDetailNameEl) riskDetailNameEl.textContent = studentName;
    if (riskDetailLoadingEl) riskDetailLoadingEl.hidden = false;
    if (riskDetailContentEl) riskDetailContentEl.hidden = true;
    if (riskDetailErrorEl) riskDetailErrorEl.hidden = true;

    try {
        const detail = await fetchStudentRiskScore(studentId, { onAuthFailure: logout });

        if (riskDetailLoadingEl) riskDetailLoadingEl.hidden = true;
        if (riskDetailContentEl) riskDetailContentEl.hidden = false;

        // Populate score cards (DOM refs cached at DOMContentLoaded)
        if (riskDetailScoreEl) riskDetailScoreEl.textContent = detail.risk_score ?? '—';
        if (riskDetailLevelEl) {
            riskDetailLevelEl.textContent = detail.risk_level || '—';
            riskDetailLevelEl.className = 'risk-detail-value';
            if (detail.risk_level === 'HIGH') riskDetailLevelEl.classList.add('risk-detail-high');
            else if (detail.risk_level === 'MEDIUM') riskDetailLevelEl.classList.add('risk-detail-medium');
            else if (detail.risk_level === 'LOW') riskDetailLevelEl.classList.add('risk-detail-low');
        }
        if (riskDetailViolationsEl) riskDetailViolationsEl.textContent = detail.violation_count ?? 0;
        if (riskDetailSwitchesEl) riskDetailSwitchesEl.textContent = detail.window_switch_count ?? 0;
        if (riskDetailSuspiciousEl) riskDetailSuspiciousEl.textContent = detail.suspicious_window_count ?? 0;
        if (riskDetailUpdatedEl) riskDetailUpdatedEl.textContent = detail.last_updated ? formatTimestamp(detail.last_updated) : '—';

        // Populate recent events (DOM refs cached at DOMContentLoaded)
        if (riskDetailEventsListEl && riskDetailEventsEl) {
            if (detail.recent_events && detail.recent_events.length > 0) {
                riskDetailEventsEl.hidden = false;
                riskDetailEventsListEl.innerHTML = detail.recent_events.map(ev => {
                    const typeBadge = getViolationTypeBadge(ev.event_type);
                    const time = formatTimestamp(ev.timestamp);
                    return `<div class="risk-detail-event">${typeBadge} <span class="risk-detail-event-time">${time}</span></div>`;
                }).join('');
            } else {
                riskDetailEventsEl.hidden = true;
            }
        }

        // Also update the cached student data with fresh values
        const existing = connectedStudents.get(studentId);
        if (existing) {
            existing.risk_score = detail.risk_score;
            existing.risk_level = detail.risk_level;
            existing.violation_count = detail.violation_count ?? 0;
            existing.window_switch_count = detail.window_switch_count ?? 0;
            existing.suspicious_window_count = detail.suspicious_window_count ?? 0;
        }

    } catch (err) {
        console.error('[Dashboard] Failed to load student risk detail:', err);
        if (riskDetailLoadingEl) riskDetailLoadingEl.hidden = true;
        if (riskDetailErrorEl) {
            riskDetailErrorEl.hidden = false;
            riskDetailErrorEl.textContent = err.message || 'Failed to load risk details.';
        }
    } finally {
        riskDetailBusy = false;
    }
}

// ─── SUSPICIOUS WINDOW ALERTS (Week 5) ──────────────────────

/**
 * Handle SUSPICIOUS_WINDOW WebSocket message.
 * HANDOFF §6: { student_id, username, window_title, application_name, risk_score }
 * @param {object} data
 */
function handleSuspiciousWindow(data) {
    if (!data || !data.student_id) return;

    const alert = {
        student_id: Number(data.student_id),
        username: data.username || `Student ${data.student_id}`,
        window_title: data.window_title || '—',
        application_name: data.application_name || '—',
        risk_score: data.risk_score ?? null,
        timestamp: new Date().toISOString()
    };

    suspiciousAlerts.unshift(alert);
    if (suspiciousAlerts.length > MAX_ALERTS) {
        suspiciousAlerts.length = MAX_ALERTS;
    }

    renderAnalytics();
    showToast(`⚠ Suspicious window: ${alert.username} — ${alert.window_title}`, 'warning');
}

/**
 * Render the behavior analytics / suspicious alerts panel.
 * Also updates the analytics summary bar (Week 5 C3).
 */
function renderAnalytics() {
    if (!analyticsTableBodyEl) return;

    if (alertCountEl) alertCountEl.textContent = suspiciousAlerts.length;

    // Single authoritative call site for analytics summary (I4)
    updateAnalyticsSummary();

    if (suspiciousAlerts.length === 0) {
        if (analyticsEmptyEl) analyticsEmptyEl.hidden = false;
        if (analyticsContentEl) analyticsContentEl.hidden = true;
        return;
    }

    if (analyticsEmptyEl) analyticsEmptyEl.hidden = true;
    if (analyticsContentEl) analyticsContentEl.hidden = false;

    analyticsTableBodyEl.innerHTML = suspiciousAlerts.map((a, i) => {
        const time = formatTimestamp(a.timestamp);
        const riskBadge = renderRiskBadge(a.risk_score);
        const isNew = i === 0 ? 'violation-new' : '';
        return `
            <tr class="${isNew}">
                <td>${time}</td>
                <td>${escapeHtml(a.username)}</td>
                <td class="cell-truncate" title="${escapeHtml(a.window_title)}">${escapeHtml(a.window_title)}</td>
                <td>${escapeHtml(a.application_name)}</td>
                <td>${riskBadge}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Update the analytics summary bar with aggregated counts.
 * Counts high-risk students, total violations, and suspicious windows from student data.
 */
function updateAnalyticsSummary() {
    const highRiskCount = [...connectedStudents.values()].filter(s => (s.risk_score ?? 0) > 60).length;
    const totalViolations = violations.length;
    const suspiciousWindowCount = suspiciousAlerts.length;

    if (summaryHighRiskEl) summaryHighRiskEl.textContent = highRiskCount;
    if (summaryTotalViolationsEl) summaryTotalViolationsEl.textContent = totalViolations;
    if (summarySuspiciousWindowsEl) summarySuspiciousWindowsEl.textContent = suspiciousWindowCount;

    // Show summary bar if there's any data
    if (analyticsSummaryEl) {
        analyticsSummaryEl.hidden = (highRiskCount === 0 && totalViolations === 0 && suspiciousWindowCount === 0);
    }
}

// ─── STUDENT LIST RENDERING ─────────────────────────────────

/**
 * Render the student list table with risk scores and screenshot request button.
 */
function renderStudentList() {
    if (!studentTableBodyEl) return;

    // Update count badge (only ONLINE students)
    const onlineCount = [...connectedStudents.values()].filter(s => s.status === 'ONLINE').length;
    if (studentCountEl) {
        studentCountEl.textContent = onlineCount;
    }

    // Analytics summary is updated when data changes (new violation, risk score, suspicious alert)
    updateAnalyticsSummary();

    // Show/hide empty state vs table
    if (connectedStudents.size === 0) {
        studentTableEl.hidden = true;
        studentListEmptyEl.hidden = false;
        return;
    }

    studentTableEl.hidden = false;
    studentListEmptyEl.hidden = true;

    // Sort: high-risk first, then online first, then by username
    const statusOrder = { ONLINE: 0, STALE: 1, OFFLINE: 2 };
    const sorted = [...connectedStudents.values()].sort((a, b) => {
        // High-risk online students bubble to top
        const aHighRisk = a.status === 'ONLINE' && (a.risk_score ?? 0) > 60;
        const bHighRisk = b.status === 'ONLINE' && (b.risk_score ?? 0) > 60;
        if (aHighRisk && !bHighRisk) return -1;
        if (!aHighRisk && bHighRisk) return 1;

        const orderA = statusOrder[a.status] ?? 2;
        const orderB = statusOrder[b.status] ?? 2;
        if (orderA !== orderB) return orderA - orderB;

        // Then by risk score descending
        const riskA = a.risk_score ?? 0;
        const riskB = b.risk_score ?? 0;
        if (riskA !== riskB) return riskB - riskA;

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
        const riskBadge = renderRiskBadge(student.risk_score, student.risk_level);
        const isHighRisk = student.status === 'ONLINE' && (student.risk_score ?? 0) > 60;
        const rowClass = isHighRisk ? `${statusClass} student-row student-high-risk` : `${statusClass} student-row`;

        // Screenshot request button (only for online students)
        const screenshotBtn = student.status === 'ONLINE'
            ? `<button class="btn-screenshot" data-student-id="${student.student_id}" title="Request screenshot">📷 Request</button>`
            : '<span class="text-muted">—</span>';

        // Risk detail button (only show if student has risk data)
        const detailBtn = student.risk_score !== null
            ? `<button class="btn-risk-detail" data-student-id="${student.student_id}" data-student-name="${escapeHtml(student.username)}" title="View risk details">📊 Detail</button>`
            : '';

        return `
            <tr class="${rowClass}" data-student-id="${student.student_id}" data-student-name="${escapeHtml(student.username)}" role="button" tabindex="0" title="Click to view violation history">
                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                <td>${escapeHtml(student.username)}</td>
                <td>${student.student_id}</td>
                <td>${riskBadge}</td>
                <td>${lastSeen}</td>
                <td>${screenshotBtn} ${detailBtn}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Render a risk score badge with color coding.
 * @param {number|null} score
 * @param {string|null} [level]
 * @returns {string} HTML string
 */
function renderRiskBadge(score, level) {
    if (score === null || score === undefined) {
        return '<span class="risk-badge" style="background:#f3f4f6;color:#9ca3af;">—</span>';
    }

    // Derive level from score if not provided
    if (!level) {
        if (score <= 30) level = 'LOW';
        else if (score <= 60) level = 'MEDIUM';
        else level = 'HIGH';
    }

    const classMap = { LOW: 'risk-low', MEDIUM: 'risk-medium', HIGH: 'risk-high' };
    const css = classMap[level] || 'risk-low';
    return `<span class="risk-badge ${css}" title="${level} risk">${score}</span>`;
}

// ─── WS STATUS INDICATOR ────────────────────────────────────

/**
 * Update the WebSocket connection indicator in the header.
 * @param {'disconnected'|'connecting'|'connected'|'reconnecting'} state
 */
function updateWsStatusIndicator(state) {
    if (!wsStatusEl || !wsLabelEl) return;

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

// ─── VIOLATION MANAGEMENT (Week 3 + Week 5 enhanced) ────────

/**
 * Handle NEW_VIOLATION message from WebSocket.
 * HANDOFF §6: { student_id, username, event_type, application_name, timestamp, screenshot_id, risk_score }
 * @param {object} data
 */
function handleNewViolation(data) {
    if (!data || !data.student_id || !data.event_type) {
        console.warn('[Dashboard] Invalid NEW_VIOLATION data:', data);
        return;
    }

    const violation = {
        event_id: data.event_id ?? null,
        student_id: Number(data.student_id),
        username: data.username || `Student ${data.student_id}`,
        event_type: data.event_type,
        application_name: data.application_name || '—',
        window_title: data.window_title || null,
        duration_seconds: data.duration_seconds ?? null,
        timestamp: data.timestamp || new Date().toISOString(),
        screenshot_id: data.screenshot_id ?? null,
        risk_score: data.risk_score ?? null
    };

    // Prepend (newest first), cap at MAX_VIOLATIONS
    violations.unshift(violation);
    if (violations.length > MAX_VIOLATIONS) {
        violations.length = MAX_VIOLATIONS;
    }

    renderViolations();
    updateAnalyticsSummary();
    showViolationToast(violation);
    updatePageTitle();
}

/**
 * Render the live violations table with filtering (Week 5).
 */
function renderViolations() {
    if (!violationsTableBodyEl) return;

    // Apply filter
    let filtered = currentViolationFilter === 'ALL'
        ? [...violations]
        : violations.filter(v => v.event_type === currentViolationFilter);

    // Apply sort (Week 5)
    if (violationSortField) {
        filtered.sort((a, b) => {
            const getVal = (v) => {
                if (violationSortField === 'timestamp') {
                    const t = Date.parse(v.timestamp);
                    return Number.isNaN(t) ? 0 : t;
                }
                return v[violationSortField] ?? 0;
            };

            const aVal = getVal(a);
            const bVal = getVal(b);
            return violationSortAsc ? aVal - bVal : bVal - aVal;
        });
    }

    // Update count badge (always show total)
    if (violationCountEl) {
        violationCountEl.textContent = violations.length;
    }

    // Empty state
    if (filtered.length === 0) {
        violationsTableEl.hidden = true;
        violationsEmptyEl.hidden = false;
        violationsEmptyEl.textContent = currentViolationFilter === 'ALL'
            ? 'No violations detected.'
            : `No ${currentViolationFilter.replace(/_/g, ' ').toLowerCase()} violations.`;
        return;
    }

    violationsTableEl.hidden = false;
    violationsEmptyEl.hidden = true;

    violationsTableBodyEl.innerHTML = filtered.map((v, index) => {
        const typeBadge = getViolationTypeBadge(v.event_type);
        const time = formatTimestamp(v.timestamp);
        // Only flash newest row when not sorted (sort changes row order)
        const isNew = (!violationSortField && index === 0) ? 'violation-new' : '';
        const windowTitle = v.window_title ? escapeHtml(v.window_title) : '—';
        const riskBadge = renderRiskBadge(v.risk_score);
        const screenshotCell = renderScreenshotCell(v.screenshot_id);
        const duration = formatDuration(v.duration_seconds);

        return `
            <tr class="${isNew}" data-event-id="${v.event_id || ''}">
                <td>${time}</td>
                <td>${escapeHtml(v.username)}</td>
                <td>${typeBadge}</td>
                <td>${escapeHtml(v.application_name)}</td>
                <td class="cell-truncate" title="${windowTitle}">${windowTitle}</td>
                <td>${duration}</td>
                <td>${riskBadge}</td>
                <td class="screenshot-cell">${screenshotCell}</td>
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

// ─── VIOLATION HISTORY (Week 3 + Week 5 enhanced) ───────────

/**
 * Fetch and display violation history for a specific student.
 * Uses GET /monitoring/events?student_id={id} (HANDOFF §3)
 * @param {number} studentId
 * @param {string} studentName
 */
async function loadViolationHistory(studentId, studentName) {
    if (!historySectionEl) return;

    const currentRequestId = ++historyRequestId;

    historySectionEl.hidden = false;
    historySectionEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    historyStudentNameEl.textContent = studentName;

    historyLoadingEl.hidden = false;
    historyEmptyEl.hidden = true;
    historyErrorEl.hidden = true;
    historyTableEl.hidden = true;

    try {
        const events = await fetchMonitoringEvents(studentId, { onAuthFailure: logout });

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
            const screenshotCell = renderScreenshotCell(ev.screenshot_id);
            const duration = formatDuration(ev.duration_seconds);
            return `
                <tr>
                    <td>${time}</td>
                    <td>${typeBadge}</td>
                    <td>${appName}</td>
                    <td class="cell-truncate" title="${windowTitle}">${windowTitle}</td>
                    <td>${duration}</td>
                    <td class="screenshot-cell">${screenshotCell}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
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
    const message = `${violation.username} — ${violation.event_type.replace(/_/g, ' ')}${violation.application_name !== '—' ? ': ' + violation.application_name : ''}`;
    showToast(message, 'warning');
}

/* showViolationToast now delegates to the generic showToast() in screenshots.js */
// Legacy wrapper kept to avoid changing call sites.
// The original standalone implementation has been removed to avoid
// dual toast systems competing for the same #toastContainer.

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
 * Mark all students as stale when connection is lost.
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
 * Format seconds into a human-readable duration string.
 * @param {number|null} seconds
 * @returns {string} e.g. '45s', '2m 15s', '—'
 */
function formatDuration(seconds) {
    if (seconds === null || seconds === undefined) return '—';
    seconds = Math.round(seconds);
    if (seconds <= 0) return '—';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
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
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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

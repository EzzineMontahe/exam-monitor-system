// screenshots.js - Screenshot Viewing & Manual Request Module (Week 5)
// HANDOFF §5: Screenshot endpoints + SCREENSHOT_AVAILABLE WS message

// ─── STATE ──────────────────────────────────────────────────

/** Cache of loaded screenshot blob URLs: Map<cacheKey, blobURL> */
const screenshotCache = new Map();

/** Max entries in screenshot cache before LRU eviction */
const MAX_SCREENSHOT_CACHE = 50;

/** Tracks pending manual screenshot requests: Map<student_id, request_id> */
const pendingScreenshotRequests = new Map();

/**
 * Store a blob URL in the screenshot cache with LRU eviction.
 * Revokes the oldest blob URL when cache exceeds MAX_SCREENSHOT_CACHE.
 * @param {string} key
 * @param {string} blobUrl
 */
function screenshotCacheSet(key, blobUrl) {
    // If key already exists, delete so it moves to end (newest)
    if (screenshotCache.has(key)) {
        URL.revokeObjectURL(screenshotCache.get(key));
        screenshotCache.delete(key);
    }
    // Evict oldest if at capacity
    while (screenshotCache.size >= MAX_SCREENSHOT_CACHE) {
        const oldest = screenshotCache.keys().next().value;
        URL.revokeObjectURL(screenshotCache.get(oldest));
        screenshotCache.delete(oldest);
    }
    screenshotCache.set(key, blobUrl);
}

// ─── DOM REFERENCES ─────────────────────────────────────────
let modalOverlayEl, modalImageEl, modalLoadingEl, modalErrorEl, modalTitleEl, modalMetaEl, modalCloseBtn;

// ─── INITIALISATION ─────────────────────────────────────────

/**
 * Initialise screenshot module. Called from dashboard.js DOMContentLoaded.
 */
function initScreenshots() {
    modalOverlayEl = document.getElementById('screenshotModal');
    modalImageEl   = document.getElementById('modalImage');
    modalLoadingEl = document.getElementById('modalLoading');
    modalErrorEl   = document.getElementById('modalError');
    modalTitleEl   = document.getElementById('modalTitle');
    modalMetaEl    = document.getElementById('modalMeta');
    modalCloseBtn  = document.getElementById('modalCloseBtn');

    // Close modal handlers
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeScreenshotModal);
    }
    if (modalOverlayEl) {
        modalOverlayEl.addEventListener('click', (e) => {
            if (e.target === modalOverlayEl) closeScreenshotModal();
        });
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlayEl && !modalOverlayEl.hidden) {
            closeScreenshotModal();
        }
    });
}

/**
 * Render a screenshot thumbnail HTML or a clickable indicator.
 * Lazy-loads by returning a placeholder that triggers load on visibility.
 * @param {number|null} screenshotId
 * @returns {string} HTML string
 */
function renderScreenshotCell(screenshotId) {
    if (!screenshotId) return '<span class="text-muted">—</span>';
    return `<button class="screenshot-indicator" data-screenshot-id="${screenshotId}" title="View screenshot">
        <span class="screenshot-icon">📷</span> View
    </button>`;
}

// ─── MODAL ──────────────────────────────────────────────────

/**
 * Open the screenshot modal and load the full image.
 * @param {number} screenshotId
 * @param {object} [meta] - optional metadata
 * @param {string} [meta.trigger_type]
 * @param {string} [meta.captured_at]
 * @param {number} [meta.student_id]
 */
async function openScreenshotModal(screenshotId, meta = {}) {
    if (!modalOverlayEl) return;

    modalOverlayEl.hidden = false;
    modalImageEl.hidden = true;
    modalLoadingEl.hidden = false;
    modalErrorEl.hidden = true;

    // Title
    if (modalTitleEl) {
        modalTitleEl.textContent = meta.trigger_type
            ? `Screenshot — ${meta.trigger_type.replace(/_/g, ' ')}`
            : 'Screenshot';
    }

    // Meta
    if (modalMetaEl) {
        const parts = [];
        if (meta.captured_at) parts.push(`Captured: ${formatTimestamp(meta.captured_at)}`);
        if (meta.trigger_type) parts.push(`Trigger: ${meta.trigger_type}`);
        if (meta.student_id) parts.push(`Student ID: ${meta.student_id}`);
        modalMetaEl.textContent = parts.join(' • ');
    }

    // Check cache for full image
    const cacheKey = `full_${screenshotId}`;
    if (screenshotCache.has(cacheKey)) {
        showModalImage(screenshotCache.get(cacheKey));
        return;
    }

    try {
        const url = getScreenshotDownloadURL(screenshotId);
        const blobUrl = await fetchImageAsBlob(url, { onAuthFailure: logout });
        screenshotCacheSet(cacheKey, blobUrl);
        showModalImage(blobUrl);
    } catch (err) {
        console.error('[Screenshots] Failed to load full image:', err);
        modalLoadingEl.hidden = true;
        modalErrorEl.hidden = false;
        modalErrorEl.textContent = err.message || 'Failed to load screenshot.';
    }
}

/**
 * Display image in modal.
 * @param {string} blobUrl
 */
function showModalImage(blobUrl) {
    modalLoadingEl.hidden = true;
    modalImageEl.src = blobUrl;
    modalImageEl.hidden = false;
}

/**
 * Close the screenshot modal.
 */
function closeScreenshotModal() {
    if (modalOverlayEl) {
        modalOverlayEl.hidden = true;
    }
    if (modalImageEl) {
        modalImageEl.src = '';
        modalImageEl.hidden = true;
    }
}

// ─── MANUAL SCREENSHOT REQUEST ──────────────────────────────

/**
 * Request a manual screenshot for a student.
 * @param {number} studentId
 * @param {HTMLButtonElement} btn - the button element to show loading state
 */
async function handleManualScreenshotRequest(studentId, btn) {
    if (pendingScreenshotRequests.has(studentId)) {
        showToast('A screenshot request is already pending for this student.', 'warning');
        return;
    }

    btn.disabled = true;
    btn.classList.add('loading');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Requesting...';

    try {
        const result = await requestScreenshot(studentId, { onAuthFailure: logout });
        pendingScreenshotRequests.set(studentId, result.request_id);
        showToast(`Screenshot requested for Student ${studentId}.`, 'info');

        // Timeout: clear pending after 30 seconds
        // Re-query DOM inside callback since renderStudentList() may have replaced the original btn
        setTimeout(() => {
            if (pendingScreenshotRequests.has(studentId)) {
                pendingScreenshotRequests.delete(studentId);
                const currentBtn = document.querySelector(`.btn-screenshot[data-student-id="${studentId}"]`);
                if (currentBtn) {
                    currentBtn.disabled = false;
                    currentBtn.classList.remove('loading');
                    currentBtn.textContent = originalText;
                }
            }
        }, 30000);

    } catch (err) {
        console.error('[Screenshots] Request failed:', err);
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.textContent = originalText;

        const msg = err.message || 'Failed to request screenshot.';
        if (msg.includes('429') || msg.includes('rate limit') || msg.includes('Too Many')) {
            showToast('Rate limit reached. Please wait before requesting again.', 'warning');
        } else if (msg.includes('400') || msg.includes('not connected')) {
            showToast('Student is not currently connected.', 'warning');
        } else {
            showToast(msg, 'error');
        }
    }
}

/**
 * Handle SCREENSHOT_AVAILABLE WebSocket message.
 * @param {object} data - {screenshot_id, student_id, event_id, trigger_type, thumbnail_url}
 */
function handleScreenshotAvailable(data) {
    if (!data || !data.screenshot_id) return;

    // If this was a manual request, clear pending state
    if (pendingScreenshotRequests.has(data.student_id)) {
        pendingScreenshotRequests.delete(data.student_id);

        // Re-enable the button
        const btn = document.querySelector(`.btn-screenshot[data-student-id="${data.student_id}"]`);
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('loading');
            btn.textContent = '📷 Request';
        }

        showToast(`Screenshot received from Student ${data.student_id}.`, 'success');
    }

    // Update any violation rows that reference this event
    if (data.event_id) {
        const indicators = document.querySelectorAll(`[data-event-id="${data.event_id}"] .screenshot-cell`);
        indicators.forEach(cell => {
            cell.innerHTML = renderScreenshotCell(data.screenshot_id);
        });
    }
}

// ─── GENERIC TOAST (extended for Week 5) ────────────────────

/**
 * Show a generic toast notification. Extends existing toast system.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const MAX_TOASTS = 5;
    while (container.children.length >= MAX_TOASTS) {
        container.firstElementChild.remove();
    }

    const iconMap = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${iconMap[type] || 'ℹ'}</span>
        <span class="toast-text">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => { toast.classList.add('toast-visible'); });

    setTimeout(() => {
        toast.classList.remove('toast-visible');
        toast.addEventListener('transitionend', () => toast.remove());
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 500);
    }, 5000);
}

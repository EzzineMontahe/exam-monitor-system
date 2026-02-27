// blacklist.js - Blacklist Management Module (Week 4)
// HANDOFF §2: GET /blacklist, POST /blacklist, DELETE /blacklist/{id}

// ─── STATE ──────────────────────────────────────────────────
/** @type {Array<{id: number, name: string, type: string}>} */
let blacklistItems = [];

/** Prevents double-submit on add/delete */
let blacklistBusy = false;

// ─── DOM REFERENCES ─────────────────────────────────────────
let blFormEl, blNameInput, blTypeSelect, blSubmitBtn;
let blTableEl, blTableBodyEl, blEmptyEl, blLoadingEl, blFeedbackEl;

// ─── INITIALISATION ─────────────────────────────────────────

/**
 * Initialise blacklist panel. Called from dashboard.js DOMContentLoaded.
 */
function initBlacklist() {
    // Cache DOM
    blFormEl        = document.getElementById('blacklistForm');
    blNameInput     = document.getElementById('blName');
    blTypeSelect    = document.getElementById('blType');
    blSubmitBtn     = document.getElementById('blSubmitBtn');
    blTableEl       = document.getElementById('blacklistTable');
    blTableBodyEl   = document.getElementById('blacklistTableBody');
    blEmptyEl       = document.getElementById('blacklistEmpty');
    blLoadingEl     = document.getElementById('blacklistLoading');
    blFeedbackEl    = document.getElementById('blacklistFeedback');

    // Wire form submit
    if (blFormEl) {
        blFormEl.addEventListener('submit', handleBlacklistAdd);
    }

    // Wire table delete buttons via event delegation
    if (blTableBodyEl) {
        blTableBodyEl.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.bl-delete-btn');
            if (deleteBtn) {
                const itemId = Number(deleteBtn.dataset.itemId);
                const itemName = deleteBtn.dataset.itemName || '';
                handleBlacklistDelete(itemId, itemName);
            }
        });
    }

    // Fetch initial data
    loadBlacklist();
}

// ─── DATA FETCHING ──────────────────────────────────────────

/**
 * Fetch blacklist from backend and render.
 */
async function loadBlacklist() {
    showBlacklistLoading(true);

    try {
        blacklistItems = await fetchBlacklist({ onAuthFailure: logout });
        renderBlacklist();
    } catch (err) {
        console.error('[Blacklist] Failed to load:', err);
        showBlacklistFeedback(err.message || 'Failed to load blacklist.', 'error');
        blacklistItems = [];
        renderBlacklist();
    } finally {
        showBlacklistLoading(false);
    }
}

// ─── ADD ITEM ───────────────────────────────────────────────

/**
 * Handle add-item form submission.
 * @param {Event} e
 */
async function handleBlacklistAdd(e) {
    e.preventDefault();
    if (blacklistBusy) return;

    const name = blNameInput.value.trim();
    const type = blTypeSelect.value;

    // Client-side validation
    if (!name) {
        showBlacklistFeedback('Please enter a name.', 'error');
        blNameInput.focus();
        return;
    }

    if (name.length > 255) {
        showBlacklistFeedback('Name is too long (max 255 characters).', 'error');
        blNameInput.focus();
        return;
    }

    if (type !== 'APPLICATION' && type !== 'WEBSITE') {
        showBlacklistFeedback('Please select a valid type.', 'error');
        return;
    }

    // Check local duplicate
    const duplicate = blacklistItems.find(
        item => item.name.toLowerCase() === name.toLowerCase() && item.type === type
    );
    if (duplicate) {
        showBlacklistFeedback('This item is already in the blacklist.', 'error');
        return;
    }

    blacklistBusy = true;
    blSubmitBtn.disabled = true;
    blSubmitBtn.textContent = 'Adding...';
    hideBlacklistFeedback();

    try {
        await addBlacklistItem(name, type, { onAuthFailure: logout });

        // Clear form
        blNameInput.value = '';
        blTypeSelect.selectedIndex = 0;

        // Refresh list, then show feedback (loadBlacklist no longer hides feedback)
        await loadBlacklist();
        showBlacklistFeedback(`"${name}" added to blacklist.`, 'success');
    } catch (err) {
        console.error('[Blacklist] Add failed:', err);
        const msg = err.message || 'Failed to add item.';
        // Handle 409 duplicate from backend
        if (msg.includes('already exists') || msg.includes('409')) {
            showBlacklistFeedback('Item already exists in the blacklist.', 'error');
        } else {
            showBlacklistFeedback(msg, 'error');
        }
    } finally {
        blacklistBusy = false;
        blSubmitBtn.disabled = false;
        blSubmitBtn.textContent = 'Add';
    }
}

// ─── DELETE ITEM ────────────────────────────────────────────

/**
 * Handle delete button click with confirmation.
 * @param {number} itemId
 * @param {string} itemName
 */
async function handleBlacklistDelete(itemId, itemName) {
    if (blacklistBusy) return;

    const confirmed = confirm(`Remove "${itemName}" from blacklist?`);
    if (!confirmed) return;

    blacklistBusy = true;
    hideBlacklistFeedback();

    // Optimistic: dim the row
    const row = blTableBodyEl.querySelector(`tr[data-item-id="${itemId}"]`);
    if (row) row.style.opacity = '0.5';

    try {
        await deleteBlacklistItem(itemId, { onAuthFailure: logout });

        // Refresh list, then show feedback (loadBlacklist no longer hides feedback)
        await loadBlacklist();
        showBlacklistFeedback(`"${itemName}" removed from blacklist.`, 'success');
    } catch (err) {
        console.error('[Blacklist] Delete failed:', err);
        // Restore row opacity
        if (row) row.style.opacity = '1';

        const msg = err.message || 'Failed to remove item.';
        if (msg.includes('not found') || msg.includes('404')) {
            showBlacklistFeedback('Item not found — it may have been deleted already.', 'error');
            await loadBlacklist(); // Re-sync
        } else {
            showBlacklistFeedback(msg, 'error');
        }
    } finally {
        blacklistBusy = false;
    }
}

// ─── RENDERING ──────────────────────────────────────────────

/**
 * Render blacklist table from blacklistItems state.
 */
function renderBlacklist() {
    if (!blTableBodyEl) return;

    if (blacklistItems.length === 0) {
        blTableEl.hidden = true;
        blEmptyEl.hidden = false;
        return;
    }

    blTableEl.hidden = false;
    blEmptyEl.hidden = true;

    blTableBodyEl.innerHTML = blacklistItems.map(item => {
        const typeBadge = item.type === 'APPLICATION'
            ? '<span class="bl-type-badge bl-type-app">Application</span>'
            : '<span class="bl-type-badge bl-type-web">Website</span>';

        return `
            <tr data-item-id="${item.id}">
                <td>${escapeHtml(item.name)}</td>
                <td>${typeBadge}</td>
                <td>
                    <button class="bl-delete-btn" data-item-id="${item.id}" data-item-name="${escapeHtml(item.name)}" title="Remove ${escapeHtml(item.name)}">
                        ✕
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ─── UI HELPERS ─────────────────────────────────────────────

/**
 * Show/hide loading indicator.
 * @param {boolean} show
 */
function showBlacklistLoading(show) {
    if (blLoadingEl) blLoadingEl.hidden = !show;
    if (show) {
        if (blTableEl) blTableEl.hidden = true;
        if (blEmptyEl) blEmptyEl.hidden = true;
    }
}

/**
 * Show feedback message (success/error).
 * @param {string} message
 * @param {'success'|'error'} type
 */
function showBlacklistFeedback(message, type) {
    if (!blFeedbackEl) return;
    blFeedbackEl.textContent = message;
    blFeedbackEl.className = `bl-feedback bl-feedback-${type}`;
    blFeedbackEl.hidden = false;

    // Auto-hide success after 4s
    if (type === 'success') {
        setTimeout(() => {
            if (blFeedbackEl.textContent === message) {
                blFeedbackEl.hidden = true;
            }
        }, 4000);
    }
}

/**
 * Hide feedback message.
 */
function hideBlacklistFeedback() {
    if (blFeedbackEl) {
        blFeedbackEl.hidden = true;
        blFeedbackEl.textContent = '';
    }
}

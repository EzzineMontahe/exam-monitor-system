// websocket.js - WebSocket connection & message routing (Week 2)
// API CONTRACT §6: ws://localhost:8000/ws?token=JWT_TOKEN

/**
 * WebSocket manager for the instructor dashboard.
 * Handles connection, reconnection, and message dispatching.
 *
 * Usage:
 *   const ws = new ExamWebSocket(token);
 *   ws.on('STUDENT_STATUS', (data) => { ... });
 *   ws.connect();
 */
class ExamWebSocket {
    /**
     * @param {string} token - JWT access token
     * @param {object} [options]
     * @param {function} [options.onAuthFailure] - Called when auth fails (e.g. logout)
     * @param {boolean} [options.debug=false] - Enable verbose console.debug logging
     */
    constructor(token, { onAuthFailure = null, debug = false } = {}) {
        this.token = token;
        this.socket = null;
        this.listeners = {};           // { messageType: [callback, ...] }
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 20;
        this.reconnectTimer = null;
        this.intentionalClose = false;  // true when logout/manual disconnect
        this.onAuthFailure = onAuthFailure;
        this.debug = debug;

        // Connection state: 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
        this.state = 'disconnected';
        this._stateCallbacks = [];
    }

    // ─── PUBLIC API ──────────────────────────────────────────

    /**
     * Open WebSocket connection to backend.
     */
    connect() {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            console.warn('[WS] Already connected or connecting');
            return;
        }

        this.intentionalClose = false;
        this._setState('connecting');

        const wsUrl = getWebSocketURL(this.token);
        console.log('[WS] Connecting to', wsUrl.replace(/token=.*/, 'token=***'));

        try {
            this.socket = new WebSocket(wsUrl);
        } catch (err) {
            console.error('[WS] Failed to create WebSocket:', err);
            this._setState('disconnected');
            return;
        }

        this.socket.onopen = () => this._onOpen();
        this.socket.onmessage = (event) => this._onMessage(event);
        this.socket.onclose = (event) => this._onClose(event);
        this.socket.onerror = (event) => this._onError(event);
    }

    /**
     * Gracefully close connection (no reconnect).
     */
    disconnect() {
        this.intentionalClose = true;
        clearTimeout(this.reconnectTimer);
        if (this.socket) {
            this.socket.close(1000, 'Client disconnect');
        }
        this._setState('disconnected');
    }

    /**
     * Register a handler for a specific message type.
     * @param {string} messageType - e.g. 'STUDENT_STATUS', 'NEW_VIOLATION'
     * @param {function(object): void} callback - receives message.data
     */
    on(messageType, callback) {
        if (!this.listeners[messageType]) {
            this.listeners[messageType] = [];
        }
        this.listeners[messageType].push(callback);
    }

    /**
     * Remove a specific handler.
     * @param {string} messageType
     * @param {function} callback
     */
    off(messageType, callback) {
        if (!this.listeners[messageType]) return;
        this.listeners[messageType] = this.listeners[messageType].filter(cb => cb !== callback);
    }

    /**
     * Register a callback for connection state changes.
     * @param {function(string): void} callback - receives new state
     */
    onStateChange(callback) {
        this._stateCallbacks.push(callback);
    }

    /**
     * Send a JSON message to the backend.
     * @param {object} message
     * @returns {boolean} true if sent
     */
    send(message) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.warn('[WS] Cannot send — not connected');
            return false;
        }
        this.socket.send(JSON.stringify(message));
        return true;
    }

    // ─── INTERNAL HANDLERS ───────────────────────────────────

    /** @private */
    _onOpen() {
        console.log('[WS] Connected');
        this.reconnectAttempts = 0;
        this._setState('connected');
    }

    /** @private */
    _onMessage(event) {
        let message;
        try {
            message = JSON.parse(event.data);
        } catch (err) {
            console.warn('[WS] Received non-JSON message:', event.data);
            return;
        }

        const type = message.type;
        if (!type) {
            console.warn('[WS] Message missing "type" field:', message);
            return;
        }

        if (this.debug) console.debug('[WS] Received:', type, message.data);

        // Dispatch to registered listeners
        const callbacks = this.listeners[type];
        if (callbacks && callbacks.length > 0) {
            callbacks.forEach(cb => {
                try {
                    cb(message.data);
                } catch (err) {
                    console.error(`[WS] Error in handler for "${type}":`, err);
                }
            });
        } else {
            if (this.debug) console.debug('[WS] No handler registered for type:', type);
        }
    }

    /** @private */
    _onClose(event) {
        console.log(`[WS] Closed — code: ${event.code}, reason: "${event.reason}"`);

        // Token rejected by backend (common codes for auth failure)
        if (event.code === 4001 || event.code === 4003 || event.code === 1008) {
            console.error('[WS] Authentication failed — redirecting to login');
            this._setState('disconnected');
            if (this.onAuthFailure) this.onAuthFailure();
            return;
        }

        if (this.intentionalClose) {
            this._setState('disconnected');
            return;
        }

        // Attempt reconnect
        this._scheduleReconnect();
    }

    /** @private */
    _onError(event) {
        // onerror always fires before onclose, so just log here
        console.error('[WS] Error event:', event);
    }

    // ─── RECONNECTION ────────────────────────────────────────

    /** @private */
    _scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[WS] Max reconnect attempts reached');
            this._setState('disconnected');
            return;
        }

        // Check token before reconnecting
        if (isTokenExpired(this.token)) {
            console.error('[WS] Token expired — cannot reconnect');
            this._setState('disconnected');
            if (this.onAuthFailure) this.onAuthFailure();
            return;
        }

        // Exponential backoff: 1s → 2s → 4s → 8s → ... → max 30s
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;

        console.log(`[WS] Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this._setState('reconnecting');

        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }

    // ─── STATE MANAGEMENT ────────────────────────────────────

    /** @private */
    _setState(newState) {
        if (this.state === newState) return;
        const oldState = this.state;
        this.state = newState;
        console.log(`[WS] State: ${oldState} → ${newState}`);
        this._stateCallbacks.forEach(cb => {
            try { cb(newState); } catch (err) { console.error('[WS] State callback error:', err); }
        });
    }
}

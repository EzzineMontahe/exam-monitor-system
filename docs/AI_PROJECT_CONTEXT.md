PROJECT NAME: Exam Monitoring System

SYSTEM OVERVIEW:
We are building a distributed exam monitoring system composed of:

1) Backend Server (FastAPI, Python)
2) Desktop Client Application (C# WinForms)
3) Instructor Web Dashboard (HTML/JS frontend)
4) PostgreSQL or SQLite database
5) File storage system (for screenshots)

GOAL:
Monitor student computers during exams in real-time and allow instructors to detect violations with intelligent evidence collection and advanced proctoring capabilities.

MAIN FEATURES:
- Student authentication (JWT-based)
- Real-time communication using WebSocket
- Desktop client detects:
    - Running processes
    - Active window + window title
    - Blacklisted applications
    - Suspicious behavior patterns
- Screenshot capture (triggered by violations/requests)
- Behavior analysis and risk scoring
- Live screen viewing (Inspection Mode - Week 6)
- Remote computer control (Interactive Mode - Week 6)
- Backend stores violations, screenshots, and manages sessions
- Instructor dashboard displays:
    - Connected students with risk scores
    - Live status
    - Violations with screenshot evidence
    - Window activity tracking
    - Blacklist configuration
    - Behavior analytics
    - Live screen stream viewer (Week 6)
    - Remote control interface (Week 6)

ROLES:
- Backend Developer: builds API, authentication, WebSocket, database logic, screenshot storage, risk scoring engine, inspection/control session management, stream relay.
- Desktop Developer: builds monitoring client, screenshot capture, window tracking, screen streaming, remote control command execution, and communicates with backend.
- Frontend Developer: builds instructor dashboard, screenshot viewing, risk score display, live stream viewer, remote control interface, and UI.

ARCHITECTURE RULES:
- All communication with backend must use JWT authentication.
- Real-time updates use WebSocket.
- Desktop never communicates directly with frontend.
- Frontend never communicates directly with desktop.
- Backend is the central authority.
- All monitoring data must be structured JSON.
- All critical operations must be logged.
- Screenshots only captured when triggered (never continuous).
- Screenshot capture must be asynchronous (non-blocking).
- Risk scores calculated server-side consistently.
- Only ONE inspection session active per instructor at a time.
- Only ONE control session active per instructor at a time.
- Screen streaming must not block monitoring loop.
- Remote control commands must be logged for audit.

MONITORING PHILOSOPHY:
This system uses HYBRID SMART MONITORING:
- Text-based monitoring (90% of time) - low bandwidth
- Triggered screenshots (10% of time) - only when needed
- Behavior analysis - intelligent detection
- Evidence-based - screenshots linked to violations

ADVANCED PROCTORING (WEEK 6):
- Live screen viewing (Inspection Mode) - 5-10 FPS video stream
- Remote computer control (Interactive Mode) - full mouse/keyboard control
- Both modes: Only ONE student at a time
- Inspection: Optional student notification, 10-minute timeout
- Control: Mandatory student notification, admin password required, 5-minute timeout
- All sessions logged for complete audit trail

NOT continuous surveillance:
- No constant screen recording
- No keylogging (except during remote control sessions with consent)
- No webcam access
- Privacy-conscious design
- Students notified when being watched/controlled

SECURITY REQUIREMENTS:
- Passwords must be hashed.
- JWT tokens must expire.
- Role-based access (student vs instructor).
- WebSocket must validate token.
- Screenshots stored securely.
- Screenshot access requires instructor role.
- Screenshot data deleted after exam period (30 days).
- Inspection/Control require instructor role.
- Interactive mode requires admin password.
- All inspection/control sessions logged.
- Student can emergency stop remote control (CTRL+ALT+SHIFT+E).

DEVELOPMENT RULES:
- Clean folder structure.
- Clear commit messages.
- No hardcoded credentials.
- Modular code.
- Proper error handling.
- Avoid blocking operations.
- Screenshot capture on separate thread.
- Screen streaming on separate thread.
- Always validate image size before transmission.
- Risk score calculation must be efficient.
- Enforce one-at-a-time for inspection/control.
- Log all remote control actions.

PERFORMANCE REQUIREMENTS:
- System must handle 20+ concurrent students.
- Screenshot transmission max 1 per 30 seconds per student.
- Screenshot size max 500 KB (compressed).
- Screen stream frames max 100 KB each (30% JPEG quality).
- Screen stream rate: 5-10 FPS.
- UI must remain responsive during screenshot/streaming operations.
- WebSocket must handle backpressure.
- Risk score updates must be real-time.
- Remote control commands: max 100 per second rate limit.

BANDWIDTH REQUIREMENTS:
- Normal monitoring: ~100 KB/s for 50 students (text only)
- Inspection Mode active: +250 KB/s (one student, 5 FPS)
- Interactive Mode active: +400 KB/s (one student, screen + commands)
- Total worst case: ~750 KB/s (very manageable)

IMPLEMENTATION PHASES:
Week 1: Authentication Foundation
Week 2: WebSocket & Real-Time Core
Week 3: Monitoring Engine (Process/Window Detection)
Week 4: Blacklist Control System
Week 5: Smart Monitoring (Screenshots, Risk Scores, Window Tracking)
Week 6: Advanced Proctoring (Inspection Mode, Interactive Mode, Final Integration)

When guiding me:
- Follow the architecture strictly.
- Do not redesign the system unless necessary.
- Provide production-ready structure.
- Explain why each step is necessary.
- Prioritize non-blocking implementations.
- Always consider performance impact.
- Implement screenshot features as triggered/optional only.
- Never compromise monitoring loop for screenshot capture.
- Enforce one-at-a-time for advanced proctoring features.
- Always validate admin authorization for interactive mode.
- Log all inspection/control sessions for audit compliance.

PROJECT NAME: Exam Monitoring System

SYSTEM OVERVIEW:
We are building a distributed exam monitoring system composed of:

1) Backend Server (FastAPI, Python)
2) Desktop Client Application (C# WinForms)
3) Instructor Web Dashboard (HTML/JS frontend)
4) PostgreSQL or SQLite database
5) File storage system (for screenshots)

GOAL:
Monitor student computers during exams in real-time and allow instructors to detect violations with intelligent evidence collection.

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
- Backend stores violations, screenshots, and manages sessions
- Instructor dashboard displays:
    - Connected students with risk scores
    - Live status
    - Violations with screenshot evidence
    - Window activity tracking
    - Blacklist configuration
    - Behavior analytics

ROLES:
- Backend Developer: builds API, authentication, WebSocket, database logic, screenshot storage, risk scoring engine.
- Desktop Developer: builds monitoring client, screenshot capture, window tracking, and communicates with backend.
- Frontend Developer: builds instructor dashboard, screenshot viewing, risk score display, and UI.

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

MONITORING PHILOSOPHY:
This system uses HYBRID SMART MONITORING:
- Text-based monitoring (90% of time) - low bandwidth
- Triggered screenshots (10% of time) - only when needed
- Behavior analysis - intelligent detection
- Evidence-based - screenshots linked to violations

NOT continuous surveillance:
- No constant screen recording
- No keylogging
- No webcam access
- Privacy-conscious design

SECURITY REQUIREMENTS:
- Passwords must be hashed.
- JWT tokens must expire.
- Role-based access (student vs instructor).
- WebSocket must validate token.
- Screenshots stored securely.
- Screenshot access requires instructor role.
- Screenshot data deleted after exam period (30 days).

DEVELOPMENT RULES:
- Clean folder structure.
- Clear commit messages.
- No hardcoded credentials.
- Modular code.
- Proper error handling.
- Avoid blocking operations.
- Screenshot capture on separate thread.
- Always validate image size before transmission.
- Risk score calculation must be efficient.

PERFORMANCE REQUIREMENTS:
- System must handle 20+ concurrent students.
- Screenshot transmission max 1 per 30 seconds per student.
- Screenshot size max 500 KB (compressed).
- UI must remain responsive during screenshot operations.
- WebSocket must handle backpressure.
- Risk score updates must be real-time.

IMPLEMENTATION PHASES:
Week 1-4: Core monitoring system (process detection, blacklist, violations)
Week 5: Hybrid smart monitoring (screenshots, window tracking, risk scores)
Week 6: Integration, testing, polish

When guiding me:
- Follow the architecture strictly.
- Do not redesign the system unless necessary.
- Provide production-ready structure.
- Explain why each step is necessary.
- Prioritize non-blocking implementations.
- Always consider performance impact.
- Implement screenshot features as triggered/optional only.
- Never compromise monitoring loop for screenshot capture.

PROJECT NAME: Exam Monitoring System

SYSTEM OVERVIEW:
We are building a distributed exam monitoring system composed of:

1) Backend Server (FastAPI, Python)
2) Desktop Client Application (C# WinForms)
3) Instructor Web Dashboard (HTML/JS frontend)
4) PostgreSQL or SQLite database

GOAL:
Monitor student computers during exams in real-time and allow instructors to detect violations.

MAIN FEATURES:
- Student authentication (JWT-based)
- Real-time communication using WebSocket
- Desktop client detects:
    - Running processes
    - Active window
    - Blacklisted applications
- Backend stores violations and manages sessions
- Instructor dashboard displays:
    - Connected students
    - Live status
    - Violations
    - Blacklist configuration

ROLES:
- Backend Developer: builds API, authentication, WebSocket, database logic.
- Desktop Developer: builds monitoring client and communicates with backend.
- Frontend Developer: builds instructor dashboard and UI.

ARCHITECTURE RULES:
- All communication with backend must use JWT authentication.
- Real-time updates use WebSocket.
- Desktop never communicates directly with frontend.
- Frontend never communicates directly with desktop.
- Backend is the central authority.
- All monitoring data must be structured JSON.
- All critical operations must be logged.

SECURITY REQUIREMENTS:
- Passwords must be hashed.
- JWT tokens must expire.
- Role-based access (student vs instructor).
- WebSocket must validate token.

DEVELOPMENT RULES:
- Clean folder structure.
- Clear commit messages.
- No hardcoded credentials.
- Modular code.
- Proper error handling.
- Avoid blocking operations.

When guiding me:
- Follow the architecture strictly.
- Do not redesign the system unless necessary.
- Provide production-ready structure.
- Explain why each step is necessary.
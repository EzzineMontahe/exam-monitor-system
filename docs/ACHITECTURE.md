Project: Exam Monitoring System

------------------------------------------------------------
1. SYSTEM ARCHITECTURE OVERVIEW
------------------------------------------------------------

This system follows a centralized client-server architecture.

There are three main components:

1) Backend Server (FastAPI, Python)
2) Desktop Client (C# WinForms)
3) Instructor Web Dashboard (HTML/JS)

All communication flows through the backend.
Desktop and frontend NEVER communicate directly.

------------------------------------------------------------
2. HIGH LEVEL COMPONENT RELATIONSHIP
------------------------------------------------------------

Desktop Client
      |
      |  (REST + WebSocket + JWT)
      v
Backend Server  <------>  Database
      ^
      |
      |  (REST + WebSocket + JWT)
Frontend Dashboard

Backend is the single source of truth.

------------------------------------------------------------
3. RESPONSIBILITY SEPARATION
------------------------------------------------------------

Backend:
- Authentication (JWT)
- Role validation (student / instructor)
- WebSocket management
- Monitoring event validation
- Blacklist management
- Data persistence
- Logging

Desktop Client:
- Student login
- Connect to backend WebSocket
- Send heartbeat every 5 seconds
- Detect:
    - Running processes
    - Active window
    - Blacklisted applications
- Send structured monitoring events

Frontend Dashboard:
- Instructor login
- Display connected students
- Display violations in real-time
- Configure blacklist
- View historical monitoring data

------------------------------------------------------------
4. COMMUNICATION RULES
------------------------------------------------------------

REST API:
- Used for authentication
- Used for CRUD operations (blacklist, history)
- Always protected by JWT (except login/register)

WebSocket:
- Used for real-time monitoring events
- Requires JWT validation during connection
- Used for:
    - Student heartbeat
    - Violation reporting
    - Live instructor updates

------------------------------------------------------------
5. DATA FLOW
------------------------------------------------------------

Login Flow:
1. Client sends login credentials via REST.
2. Backend validates and returns JWT.
3. Client stores JWT.
4. Client uses JWT for all further requests.

Monitoring Flow:
1. Desktop detects event.
2. Desktop sends JSON via WebSocket.
3. Backend validates.
4. Backend stores event in DB.
5. Backend broadcasts event to instructor dashboards.

Blacklist Flow:
1. Instructor updates blacklist via REST.
2. Backend stores in DB.
3. Desktop fetches updated blacklist.
4. Desktop enforces rules locally.

------------------------------------------------------------
6. SECURITY PRINCIPLES
------------------------------------------------------------

- Passwords must be hashed using bcrypt.
- JWT must expire (e.g., 30 minutes).
- Refresh token system optional (if time allows).
- Role-based access required.
- WebSocket connections must validate token.
- Input validation required for all endpoints.
- No hardcoded secrets.
- .env used for secrets.

------------------------------------------------------------
7. DATABASE DESIGN PRINCIPLES
------------------------------------------------------------

Core tables:

Users
- id
- username
- hashed_password
- role (student / instructor)
- created_at

MonitoringEvents
- id
- student_id (FK)
- event_type
- application_name
- timestamp

Blacklist
- id
- name
- type (APPLICATION / WEBSITE)
- created_by
- created_at

All foreign keys must be enforced.

------------------------------------------------------------
8. ERROR HANDLING STRATEGY
------------------------------------------------------------

Backend:
- Return structured JSON error responses.
- Use proper HTTP status codes.
- Log critical errors.

Desktop:
- Never crash on server disconnect.
- Auto-reconnect logic for WebSocket.
- Log errors locally.

Frontend:
- Handle token expiration.
- Redirect to login if unauthorized.
- Display meaningful error messages.

------------------------------------------------------------
9. DEVELOPMENT CONSTRAINTS
------------------------------------------------------------

- Clean modular code.
- No business logic inside routes.
- No blocking operations in async endpoints.
- No duplicated JSON structures.
- API contract must be respected strictly.
- Any structural change must update API_CONTRACT.md.

------------------------------------------------------------
10. DEPLOYMENT ASSUMPTIONS
------------------------------------------------------------

Development:
- Backend runs locally (localhost).
- Desktop connects to local backend.
- Frontend served locally.

Future deployment:
- Backend on VPS.
- HTTPS required.
- CORS properly configured.

------------------------------------------------------------

When generating code:
- Follow this architecture strictly.
- Do not redesign unless explicitly instructed.
- Maintain separation of concerns.
- Prioritize clarity and maintainability.
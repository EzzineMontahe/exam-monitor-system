📄 WEEKS_OBJECTIVES.md
🗓 WEEK 1 — AUTHENTICATION FOUNDATION
🎯 Global Goal:

Full authentication system working across backend, desktop, and frontend.

👑 BACKEND DEV — WEEK 1 OBJECTIVE
Deliverables:

Working FastAPI app

Connected database

User model

Password hashing

JWT authentication

Role-based login

Must Accomplish:

Initialize FastAPI project structure.

Setup database connection.

Create Users table:

id

username

hashed_password

role

created_at

Implement:

Register endpoint

Login endpoint

Implement:

JWT creation

JWT validation dependency

Return responses EXACTLY as defined in API_CONTRACT.

Test with Postman.

Ensure wrong credentials return 401.

Definition of Done:

Can create instructor and student.

Login returns valid JWT.

JWT protects a test endpoint.

🖥 DESKTOP DEV — WEEK 1 OBJECTIVE
Deliverables:

WinForms login form

HTTP login request working

Must Accomplish:

Create WinForms project.

Design LoginForm:

Username textbox

Password textbox

Login button

Create ApiClient.cs.

Send POST /auth/login.

Parse JWT.

Store token in memory.

Handle:

Invalid credentials

Server unavailable

Definition of Done:

Student logs in successfully.

Error shown if invalid login.

🌐 FRONTEND DEV — WEEK 1 OBJECTIVE
Deliverables:

Instructor login page

Must Accomplish:

Create login.html.

Create auth.js.

Send POST /auth/login.

Store JWT in memory or localStorage.

Redirect to dashboard if success.

Block dashboard if no valid JWT.

Definition of Done:

Instructor login works.

Protected dashboard route.

🗓 WEEK 2 — WEBSOCKET & REAL-TIME CORE
🎯 Global Goal:

Real-time student connection established.

👑 BACKEND DEV
Must Accomplish:

Create WebSocket endpoint: /ws.

Extract JWT from query param.

Validate token.

Maintain connected clients list.

Handle disconnect.

Implement heartbeat validation logic.

Log connections.

Definition of Done:

Multiple students can connect.

Server logs connect/disconnect.

🖥 DESKTOP DEV
Must Accomplish:

Create WebSocketClient.cs.

Connect to /ws using JWT.

Send heartbeat JSON every 5 seconds.

Implement reconnect if disconnected.

Ensure no UI freezing (async).

Definition of Done:

Desktop shows connected state.

Backend receives heartbeat.

🌐 FRONTEND DEV
Must Accomplish:

Connect to WebSocket.

Listen for connected student events.

Display list of connected students.

Update list on disconnect.

Definition of Done:

Instructor sees live student list.

🗓 WEEK 3 — MONITORING ENGINE
🎯 Global Goal:

Detect and transmit violations.

🖥 DESKTOP DEV (Heavy Week)
Must Accomplish:

Detect running processes.

Detect active window.

Create MonitoringEvent model.

Compare running processes with blacklist.

Send violation event via WebSocket.

Ensure monitoring loop does not block UI.

Definition of Done:

Launch blacklisted app → backend receives violation.

👑 BACKEND DEV
Must Accomplish:

Create MonitoringEvents table.

Validate incoming monitoring JSON.

Store violations.

Broadcast violations to instructors.

Add GET /monitoring/events.

Definition of Done:

Violations stored and retrievable.

🌐 FRONTEND DEV
Must Accomplish:

Display violations in real-time.

Show violation history.

Update UI without refresh.

Definition of Done:

Instructor sees live alerts.

🗓 WEEK 4 — BLACKLIST CONTROL SYSTEM
🎯 Global Goal:

Instructor can control restrictions dynamically.

👑 BACKEND DEV

Create Blacklist model.

CRUD endpoints.

Role protection (instructor only).

Cache blacklist if needed.

🌐 FRONTEND DEV

Blacklist management UI.

Add/remove items.

Fetch updated list.

🖥 DESKTOP DEV

Fetch blacklist on startup.

Periodically refresh blacklist.

Enforce blacklist locally.

🗓 WEEK 5 — HARDENING & ADVANCED DETECTION
Goals:

Improve reliability.

Improve validation.

Improve error handling.

Desktop:

Desktop switching detection.

Strengthen monitoring loop.

Backend:

Add structured logging.

Improve validation.

Frontend:

Filtering.

Sorting.

Status indicators.

🗓 WEEK 6 — FULL INTEGRATION & TESTING
Goals:

Full end-to-end test.

Bug fixes.

Stability.

Demo preparation.

Each team member must:

Run full workflow daily.

Fix issues.

Improve clarity.

Write minimal documentation.

Definition of Done:

Live demo works without crashes.

Violations detected in real time.

Blacklist enforced.

System stable for 30+ minutes test.
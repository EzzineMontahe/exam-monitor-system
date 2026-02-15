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
      ^                      |
      |                      v
      |                  File Storage
      |                  (Screenshots)
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
- Screenshot storage and retrieval
- Behavior analysis (risk scoring)
- Screen stream relay (Inspection Mode)
- Remote control command relay (Interactive Mode)
- Inspection/Control session management
- One-at-a-time enforcement for advanced features
- Data persistence
- Logging

Desktop Client:
- Student login
- Connect to backend WebSocket
- Send heartbeat every 5 seconds
- Detect:
    - Running processes
    - Active window + window title
    - Blacklisted applications
    - Suspicious behavior patterns
- Capture screenshots (triggered only):
    - When violation detected
    - On manual request from instructor
    - Random spot checks (optional)
- Stream screen continuously (when inspection active)
- Receive and execute remote control commands
- Block local input during remote control
- Send structured monitoring events

Frontend Dashboard:
- Instructor login
- Display connected students with risk scores
- Display violations in real-time
- Configure blacklist
- View historical monitoring data
- View screenshot evidence
- Manual screenshot request
- Live screen viewer (Inspection Mode)
- Remote control interface (Interactive Mode)
- Inspection/Control session controls
- Behavior analytics display

------------------------------------------------------------
4. COMMUNICATION RULES
------------------------------------------------------------

REST API:
- Used for authentication
- Used for CRUD operations (blacklist, history)
- Used for screenshot retrieval
- Always protected by JWT (except login/register)

WebSocket:
- Used for real-time monitoring events
- Used for screenshot transmission (base64)
- Requires JWT validation during connection
- Used for:
    - Student heartbeat
    - Violation reporting
    - Window title updates
    - Screenshot data (triggered only)
    - Live instructor updates
    - Manual screenshot requests

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

Window Title Tracking Flow:
1. Desktop detects window focus change.
2. Desktop captures window title.
3. Desktop analyzes title for suspicious keywords.
4. Desktop sends window event via WebSocket.
5. Backend stores and analyzes for patterns.
6. Backend updates risk score.
7. Backend broadcasts if suspicious.

Screenshot Flow (Triggered):
1. Trigger condition met:
   - Violation detected (blacklisted app)
   - Manual request from instructor
   - Random spot check
   - High-risk behavior pattern
2. Desktop captures screenshot.
3. Desktop compresses image (JPEG, 60% quality).
4. Desktop converts to base64.
5. Desktop sends via WebSocket with metadata.
6. Backend validates and stores.
7. Backend links screenshot to violation/event.
8. Backend broadcasts screenshot availability to instructor.
9. Instructor views screenshot on demand.

Risk Score Calculation Flow:
1. Backend receives monitoring events.
2. Backend calculates risk score based on:
   - Number of violations
   - Frequency of window switching
   - Suspicious window titles
   - Time spent outside exam window
   - Blacklist violation severity
3. Backend updates student risk score.
4. Backend broadcasts risk update to instructors.

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
- Screenshots must be stored securely.
- Screenshot access requires instructor role.
- Screenshot URLs must be temporary/signed (optional).
- Screenshot data must be deleted after exam period.

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
- event_type (HEARTBEAT, BLACKLIST_APP, WINDOW_FOCUS, SUSPICIOUS_BEHAVIOR)
- application_name (nullable)
- window_title (nullable)
- duration_seconds (nullable)
- timestamp
- screenshot_id (FK, nullable)

Blacklist
- id
- name
- type (APPLICATION / WEBSITE)
- created_by
- created_at

Screenshots
- id
- student_id (FK)
- event_id (FK, nullable)
- trigger_type (VIOLATION, MANUAL_REQUEST, RANDOM_CHECK)
- file_path
- captured_at
- viewed_by (FK, nullable)
- viewed_at (nullable)

StudentRiskScores
- id
- student_id (FK)
- risk_score (0-100)
- violation_count
- window_switch_count
- suspicious_window_count
- last_updated

All foreign keys must be enforced.

------------------------------------------------------------
8. ERROR HANDLING STRATEGY
------------------------------------------------------------

Backend:
- Return structured JSON error responses.
- Use proper HTTP status codes.
- Log critical errors.
- Handle screenshot storage failures gracefully.
- Validate image size before processing.

Desktop:
- Never crash on server disconnect.
- Auto-reconnect logic for WebSocket.
- Log errors locally.
- Handle screenshot capture failures.
- Gracefully degrade if screenshot fails (continue monitoring).
- Handle image compression errors.

Frontend:
- Handle token expiration.
- Redirect to login if unauthorized.
- Display meaningful error messages.
- Handle missing screenshots gracefully.
- Show loading states for screenshots.

------------------------------------------------------------
9. DEVELOPMENT CONSTRAINTS
------------------------------------------------------------

- Clean modular code.
- No business logic inside routes.
- No blocking operations in async endpoints.
- No duplicated JSON structures.
- API contract must be respected strictly.
- Any structural change must update API_CONTRACT.md.
- Screenshot capture must not block UI thread.
- Screenshot transmission must be asynchronous.
- Risk score calculation must be efficient.

------------------------------------------------------------
10. SCREENSHOT IMPLEMENTATION GUIDELINES
------------------------------------------------------------

Desktop Client:
- Use System.Drawing for screenshot capture.
- Compress to JPEG with 60% quality.
- Maximum image size: 500 KB.
- If larger, reduce resolution proportionally.
- Always capture on separate thread.
- Include metadata: timestamp, trigger_type, student_id.

Backend:
- Store screenshots in file system (not database).
- Path structure: /screenshots/{student_id}/{date}/{timestamp}.jpg
- Validate image before saving.
- Maximum accepted size: 1 MB.
- Implement cleanup job (delete after 30 days).
- Track storage usage.

Frontend:
- Lazy-load screenshots (don't load all at once).
- Show thumbnails in violation list.
- Click to view full size in modal.
- Cache loaded screenshots.
- Show "Screenshot available" indicator.

------------------------------------------------------------
11. BEHAVIOR ANALYSIS RULES
------------------------------------------------------------

Risk Score Factors:
- Blacklist violation: +20 points each
- Window switch (< 10s apart): +5 points each
- Suspicious window title: +10 points
- Long idle period (> 2 min): +15 points
- Exam window not focused (> 50% time): +25 points

Risk Score Decay:
- Decreases by 1 point every 2 minutes of good behavior
- Cannot go below 0

Risk Levels:
- 0-30: Low Risk (Green)
- 31-60: Medium Risk (Yellow)
- 61-100: High Risk (Red)

Screenshot Triggers:
- Any blacklist violation (automatic)
- Risk score > 60 (automatic spot check)
- Instructor manual request
- Random check every 10 minutes (optional)

------------------------------------------------------------
12. DEPLOYMENT ASSUMPTIONS
------------------------------------------------------------

Development:
- Backend runs locally (localhost).
- Desktop connects to local backend.
- Frontend served locally.
- Screenshots stored in local directory.

Future deployment:
- Backend on VPS.
- HTTPS required.
- CORS properly configured.
- Screenshot storage on cloud (S3/Azure Blob) or dedicated volume.
- CDN for screenshot delivery (optional).
- Database backup includes screenshot metadata only.

------------------------------------------------------------
13. PERFORMANCE CONSIDERATIONS
------------------------------------------------------------

- Screenshot transmission: max 1 per 30 seconds per student.
- Risk score calculation: batch update every 10 seconds.
- Window title events: throttled to max 1 per 3 seconds.
- Screenshot cleanup: run daily at 2 AM.
- Database queries: indexed on student_id, timestamp.
- WebSocket: handle backpressure for large screenshots.

------------------------------------------------------------

When generating code:
- Follow this architecture strictly.
- Do not redesign unless explicitly instructed.
- Maintain separation of concerns.
- Prioritize clarity and maintainability.
- Implement screenshot features as optional/triggered only.
- Never block main monitoring loop for screenshots.
- Always validate data before transmission.

------------------------------------------------------------
14. INSPECTION MODE ARCHITECTURE (WEEK 6)
------------------------------------------------------------

Purpose:
Allow instructor to view ONE student's screen live (5-10 FPS video stream).

Components:

Desktop (Screen Capture):
- Capture screen at 5-10 FPS using Timer
- Compress to JPEG (30% quality for streaming)
- Convert to base64
- Send frames via WebSocket
- Maximum frame size: 100 KB
- If larger, reduce resolution proportionally
- Always on separate thread (non-blocking)

Backend (Stream Relay):
- Maintain inspection_sessions table
- Enforce: Only ONE active inspection per instructor
- Validate instructor role
- Route frames from student to instructor
- Log all inspection sessions
- Auto-disconnect after 10 minutes

Frontend (Stream Viewer):
- Canvas element for rendering stream
- Decode base64 frames
- Display at 5-10 FPS
- Controls: Start/Stop, Screenshot, Record
- Must close to inspect another student

Data Flow:
1. Instructor clicks [Watch] on student
2. Frontend sends START_INSPECTION to backend
3. Backend validates (no concurrent inspections)
4. Backend sends START_STREAMING to student desktop
5. Desktop captures frames (5 FPS) → sends to backend
6. Backend relays frames to instructor
7. Frontend renders frames on canvas
8. Instructor clicks [End] → stops streaming

Security:
- Instructor role required
- All inspections logged
- Student can be notified (optional)
- Session timeout: 10 minutes

------------------------------------------------------------
15. INTERACTIVE MODE ARCHITECTURE
------------------------------------------------------------

Purpose:
Allow instructor to control ONE student's computer remotely.

Components:

Desktop (Command Execution):
- Receive control commands via WebSocket
- Block local user input (keyboard/mouse)
- Execute remote commands:
  * MOUSE_MOVE: Move cursor to (x,y)
  * MOUSE_CLICK: Click at (x,y)
  * KEY_PRESS: Press key
  * KEY_TYPE: Type text
- Show red cursor (instructor's cursor)
- Display notification: "Remote control active"
- Log all executed commands
- Emergency stop: CTRL+ALT+SHIFT+E

Backend (Command Relay):
- Maintain control_sessions table
- Maintain control_actions log (audit trail)
- Enforce: Only ONE active control per instructor
- Require admin password for authorization
- Validate instructor role
- Route commands from instructor to student
- Log every action with timestamp
- Auto-disconnect after 5 minutes
- Rate limit: Max 100 commands per second

Frontend (Control Interface):
- Canvas for viewing student screen
- Capture instructor's mouse/keyboard
- Send commands to backend
- Show control status
- Action log display
- Must close to control another student

Data Flow:
1. Instructor clicks [Control] on student
2. Instructor enters admin password + reason
3. Backend validates authorization
4. Backend sends START_CONTROL to student desktop
5. Desktop blocks local input, shows notification
6. Desktop streams screen to instructor (like inspection)
7. Instructor's mouse/keyboard captured
8. Commands sent: Instructor → Backend → Student
9. Desktop executes commands
10. Instructor clicks [Exit] → control released

Security:
- Instructor + admin authorization required
- Reason for control logged
- Student MUST be notified (cannot be silent)
- All actions logged in control_actions table
- Student emergency stop available
- Session timeout: 5 minutes
- Limited permissions (cannot access personal files)
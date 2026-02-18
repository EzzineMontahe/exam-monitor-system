# WEEK_OBJECTIVES.md

📅 WEEK 1 — AUTHENTICATION FOUNDATION
🎯 Global Goal:

Full authentication system working across backend, desktop, and frontend.

💻 BACKEND DEV — WEEK 1 OBJECTIVE
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

📅 WEEK 2 — WEBSOCKET & REAL-TIME CORE
🎯 Global Goal:

Real-time student connection established.

💻 BACKEND DEV
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

📅 WEEK 3 — MONITORING ENGINE
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

💻 BACKEND DEV
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

📅 WEEK 4 — BLACKLIST CONTROL SYSTEM
🎯 Global Goal:

Instructor can control restrictions dynamically.

💻 BACKEND DEV

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

📅 WEEK 5 — HYBRID SMART MONITORING & HARDENING
🎯 Global Goal:

Add intelligent monitoring with triggered screenshots and behavior analysis.

Improve system reliability and user experience.

🖥 DESKTOP DEV (Heavy Week)

Must Accomplish:

Phase 1: Window Title Tracking
- Implement window focus change detection
- Capture window titles on focus change
- Track duration spent in each window
- Send WINDOW_FOCUS events via WebSocket
- Implement keyword analysis locally (optional pre-filter)

Phase 2: Screenshot Capture Module
- Create ScreenshotCapture.cs class
- Implement screen capture using System.Drawing
- Compress to JPEG (60% quality)
- Convert to base64
- Validate size < 1 MB
- Always capture on separate thread (async)

Phase 3: Triggered Screenshot Logic
- Automatically capture on violation detection
- Capture on manual request from instructor
- Implement random spot check (every 10 min - optional)
- Never block monitoring loop

Phase 4: Behavior Pattern Detection
- Track window switch frequency
- Detect rapid window switching (8+ in 30s)
- Send SUSPICIOUS_BEHAVIOR events
- Implement local behavior scoring (optional)

Definition of Done:
- Window titles sent with focus events
- Screenshot captured when violation occurs
- Screenshot sent with violation event
- Manual screenshot request works
- UI remains responsive during capture
- Image size always < 500 KB

💻 BACKEND DEV

Must Accomplish:

Phase 1: Database Extensions
- Create Screenshots table
- Create StudentRiskScores table
- Add screenshot_id FK to MonitoringEvents
- Add window_title, duration_seconds to MonitoringEvents

Phase 2: Screenshot Management
- Implement screenshot storage (file system)
- Create /screenshots/ directory structure
- Validate incoming screenshot data
- Generate unique filenames
- Link screenshots to events
- Implement GET /screenshots endpoints

Phase 3: Risk Score System
- Implement risk calculation logic
- Create scoring rules engine:
  * Blacklist violation: +20
  * Suspicious window: +10
  * Rapid switch: +5
  * Long idle: +15
- Implement score decay (-1 per 2 min)
- Create GET /monitoring/risk-scores endpoint
- Broadcast risk updates via WebSocket

Phase 4: Intelligent Triggers
- Detect window title patterns
- Trigger screenshot on high risk (>60)
- Implement manual screenshot request
- Handle screenshot request routing

Phase 5: Advanced Validation
- Validate screenshot size/format
- Implement rate limiting for screenshots
- Add structured logging
- Improve error responses

Definition of Done:
- Screenshots stored and retrievable
- Risk scores calculated in real-time
- Manual screenshot request works
- Automatic screenshot on violations
- All new endpoints working
- Database migrations successful

🌐 FRONTEND DEV

Must Accomplish:

Phase 1: Risk Score Display
- Add risk score badge to student list
- Color-code by risk level (green/yellow/red)
- Show risk score in real-time
- Add risk score history chart (optional)

Phase 2: Screenshot Viewing
- Display "Screenshot available" indicator
- Show screenshot thumbnails in violation list
- Implement click-to-enlarge modal
- Lazy-load screenshots (performance)
- Cache loaded screenshots

Phase 3: Manual Screenshot Request
- Add "Request Screenshot" button per student
- Show loading state during request
- Display screenshot when received
- Handle timeout gracefully

Phase 4: Enhanced Violations Display
- Add window title column to violations
- Add duration indicator
- Add screenshot preview column
- Implement violation filtering by type
- Add sorting by risk score

Phase 5: Behavior Analytics Panel
- Display suspicious behavior alerts
- Show window switch frequency
- Add activity timeline (optional)
- Highlight high-risk students

Phase 6: UI/UX Improvements
- Add filtering capabilities
- Add sorting options
- Improve status indicators
- Add loading states
- Improve error messaging

Definition of Done:
- Risk scores displayed with colors
- Screenshots viewable in modal
- Manual screenshot request button works
- Violations show window titles
- High-risk students highlighted
- UI smooth and responsive

📅 WEEK 6 — FULL INTEGRATION & TESTING
🎯 Global Goal:

Full end-to-end test including screenshot features.

Bug fixes, stability, demo preparation.

Each team member must:

Phase 1: Integration Testing
- Test full workflow with screenshots
- Test manual screenshot requests
- Test risk score accuracy
- Test with multiple simultaneous students
- Test screenshot storage/retrieval
- Verify screenshot cleanup

Phase 2: Performance Testing
- Test with 20+ connected students
- Monitor screenshot storage usage
- Test WebSocket with image transmission
- Verify no memory leaks
- Test under poor network conditions

Phase 3: Bug Fixes
- Fix edge cases
- Handle screenshot failures gracefully
- Improve reconnection logic
- Fix UI glitches
- Improve error handling

Phase 4: Polish & Documentation
- Clean up code
- Add comments
- Update README
- Create user guide (optional)
- Prepare demo script

Phase 5: Demo Preparation
- Set up demo environment
- Prepare demo scenario
- Test demo flow multiple times
- Prepare backup plan
- Document known limitations

Definition of Done:
- Live demo works without crashes
- Violations detected in real time
- Screenshots captured and viewable
- Risk scores update correctly
- Blacklist enforced
- System stable for 30+ minutes test
- Can demonstrate to instructor successfully

📊 FEATURE SUMMARY BY WEEK

Week 1: Authentication ✅
Week 2: Real-time Connection ✅
Week 3: Basic Monitoring ✅
Week 4: Blacklist Control ✅
Week 5: Smart Monitoring + Screenshots 🆕
Week 6: Integration & Polish ✅

🎯 CRITICAL SUCCESS FACTORS

For Week 5 Success:
- Screenshot capture MUST be async (non-blocking)
- Image compression MUST keep size < 500 KB
- Risk scoring MUST be consistent
- Manual screenshot MUST work reliably
- UI MUST remain responsive with screenshots

For Week 6 Success:
- System MUST handle 20+ students
- Screenshots MUST not degrade performance
- Demo MUST be reliable and impressive
- All features MUST work together seamlessly

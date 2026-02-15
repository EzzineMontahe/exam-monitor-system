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

📅 WEEK 6 — ADVANCED PROCTORING & FINAL INTEGRATION
🎯 Global Goal:

Implement professional-grade proctoring features (Inspection & Interactive modes).
Complete full-system integration and testing.
Prepare impressive final demo.

🖥 DESKTOP DEV — WEEK 6 OBJECTIVE (Heavy Week)

Must Accomplish:

Phase 1: Screen Streaming (Inspection Mode)
- Implement continuous screen capture (5-10 FPS)
- Create ScreenStreamCapture.cs class
- Capture screen using Timer (every 200ms for 5 FPS)
- Compress frames to JPEG (30% quality)
- Convert to base64
- Validate frame size < 100 KB
- Send SCREEN_FRAME events via WebSocket
- Implement START_STREAMING / STOP_STREAMING handlers
- Always on separate thread (non-blocking)
- Show optional notification: "👁️ Being watched"

Phase 2: Remote Control (Interactive Mode)
- Create RemoteControlHandler.cs class
- Implement input blocking mechanism
  * Block local mouse events
  * Block local keyboard events
  * Intercept at low level using Windows API
- Implement command execution
  * MOUSE_MOVE → SetCursorPos()
  * MOUSE_CLICK → mouse_event()
  * KEY_PRESS → keybd_event()
- Display red cursor for instructor
- Show full-screen notification "🎮 Remote control active"
- Implement emergency stop (CTRL+ALT+SHIFT+E)
- Log all executed commands locally

Phase 3: Integration
- Ensure streaming doesn't interfere with monitoring
- Handle concurrent operations gracefully
- Maintain monitoring during inspection/control
- Auto-reconnect if WebSocket drops during session

Phase 4: Testing
- Test screen streaming quality (5 FPS acceptable)
- Test input blocking (student can't interfere)
- Test remote control accuracy
- Test emergency stop
- Test with poor network conditions

Definition of Done:
- Screen streaming works at 5 FPS
- Frames always < 100 KB
- Remote control accurate (mouse/keyboard)
- Student input blocked during control
- Emergency stop functional
- No crashes during sessions
- Monitoring continues during advanced features

💻 BACKEND DEV — WEEK 6 OBJECTIVE

Must Accomplish:

Phase 1: Database Extensions
- Create inspection_sessions table:
  * id, instructor_id, student_id
  * started_at, ended_at, duration_seconds
  * student_notified, screenshots_captured
- Create control_sessions table:
  * id, instructor_id, student_id
  * reason, authorized_by, admin_password_hash
  * started_at, ended_at, duration_seconds
- Create control_actions table:
  * id, session_id, action_type
  * action_data (JSONB), timestamp

Phase 2: Session Management
- Create InspectionManager class
  * Enforce: Only ONE active inspection per instructor
  * Track active sessions: {instructor_id: student_id}
  * Validate no concurrent inspections
  * Auto-timeout after 10 minutes
- Create ControlManager class
  * Enforce: Only ONE active control per instructor
  * Require admin password validation
  * Track active sessions
  * Auto-timeout after 5 minutes
  * Log every action to control_actions table

Phase 3: Stream Relay
- Implement frame relay (Inspection Mode)
  * Receive SCREEN_FRAME from student
  * Validate frame size
  * Relay to watching instructor
  * Track frame rate
- Implement command relay (Interactive Mode)
  * Receive commands from instructor
  * Validate session active
  * Relay to controlled student
  * Log every command
  * Rate limit: 100 commands/second

Phase 4: REST API Endpoints
- POST /inspection/start
- POST /inspection/stop
- GET /inspection/history
- POST /control/start (with admin auth)
- POST /control/stop
- GET /control/history
- GET /control/actions/{session_id}

Phase 5: WebSocket Protocol
- Add START_STREAMING / STOP_STREAMING messages
- Add SCREEN_FRAME relay
- Add START_CONTROL / STOP_CONTROL messages
- Add REMOTE_COMMAND relay
- Handle EMERGENCY_STOP from student

Phase 6: Security & Audit
- Admin password validation for control mode
- Role verification (instructor only)
- Session logging (all inspections/controls)
- Action logging (every remote command)
- Cleanup old sessions (delete after 30 days)

Definition of Done:
- Both modes enforce one-at-a-time
- Admin auth works for control mode
- Frames relay correctly (inspection)
- Commands relay correctly (control)
- All endpoints functional
- All sessions logged
- Auto-timeout working

🌐 FRONTEND DEV — WEEK 6 OBJECTIVE

Must Accomplish:

Phase 1: Inspection Mode UI
- Add [👁️ Watch] button to each student row
- Create inspection modal (full-screen)
  * Canvas element for video stream
  * Controls: [📸 Screenshot] [❌ End]
  * Real-time info panel (active window, apps)
  * Session timer
- Implement frame rendering
  * Decode base64 frames
  * Draw to canvas at 5 FPS
  * Handle dropped frames gracefully
- Disable other [Watch] buttons during inspection
- Show "Inspection active" indicator

Phase 2: Interactive Mode UI
- Add [🎮 Control] button to each student row
- Create authorization dialog
  * Admin password input
  * Reason dropdown/text field
  * [Authorize & Connect] button
- Create control interface modal (full-screen)
  * Canvas for student screen
  * Mouse/keyboard capture
  * Action log panel (shows commands sent)
  * Controls: [🔒 Lock Input] [❌ Exit]
- Implement command capture
  * Capture mouse movement on canvas
  * Convert to coordinates
  * Send MOUSE_MOVE commands
  * Capture clicks → MOUSE_CLICK
  * Capture keyboard → KEY_PRESS
- Disable other [Control] buttons during session
- Show "Control active" indicator

Phase 3: Integration
- Ensure modals don't break dashboard
- Maintain WebSocket during sessions
- Handle session timeouts gracefully
- Show appropriate error messages

Phase 4: User Experience
- Loading states for session start
- Smooth animations
- Clear status indicators
- Session end confirmation dialogs
- Error handling (student offline, timeout, etc.)

Phase 5: History & Audit
- Add "Inspection History" tab
  * List all past inspections
  * Filter by student, date, instructor
- Add "Control History" tab
  * List all past control sessions
  * Show reason, duration, actions count
  * View action log for each session

Definition of Done:
- Inspection modal renders stream smoothly
- Control modal captures input accurately
- Only one session active at a time (UI enforced)
- History tabs functional
- All error cases handled
- UI responsive and polished

📊 INTEGRATION & TESTING (ALL ROLES)

Phase 1: End-to-End Testing
- Test Inspection Mode with real student
  * Start inspection
  * View screen live (5 FPS)
  * Capture screenshots during inspection
  * End inspection
  * Verify session logged
- Test Interactive Mode with real student
  * Authorize with admin password
  * Control mouse/keyboard
  * Close apps, navigate menus
  * End control
  * Verify all actions logged
- Test concurrent monitoring
  * Inspection active while monitoring continues
  * Control active while monitoring continues
  * Screenshots still work during sessions

Phase 2: Edge Case Testing
- Test network issues
  * Dropped frames during inspection
  * Commands lost during control
  * Auto-reconnect behavior
- Test timeout scenarios
  * 10 min inspection timeout
  * 5 min control timeout
- Test emergency stop (student CTRL+ALT+SHIFT+E)
- Test student offline during session

Phase 3: Performance Testing
- Test with 20+ students connected
- Inspect multiple students sequentially
- Control multiple students sequentially
- Monitor bandwidth usage
- Check for memory leaks

Phase 4: Security Testing
- Verify one-at-a-time enforcement
- Verify admin password requirement
- Verify all sessions logged
- Verify audit trail complete
- Test unauthorized access attempts

Phase 5: Demo Preparation
- Create demo script with scenarios:
  1. Normal monitoring (Week 1-5 features)
  2. Inspection mode demo (watch high-risk student)
  3. Interactive mode demo (help frozen exam)
  4. Show audit logs
- Practice full demo (30 minutes)
- Prepare backup scenarios
- Document known limitations

Definition of Done:
- All features work together seamlessly
- No crashes during any scenario
- Smooth demo presentation
- Complete audit trail
- Professional-grade system ready
- Impressive 30-minute demo prepared


📊 FEATURE SUMMARY BY WEEK

Week 1: Authentication ✅
Week 2: Real-time Connection ✅
Week 3: Basic Monitoring ✅
Week 4: Blacklist Control ✅
Week 5: Smart Monitoring + Screenshots 🆕
Week 6: ADVANCED PROCTORING & FINAL INTEGRATION ✅

🎯 CRITICAL SUCCESS FACTORS

For Week 5 Success:
- Screenshot capture MUST be async (non-blocking)
- Image compression MUST keep size < 500 KB
- Risk scoring MUST be consistent
- Manual screenshot MUST work reliably
- UI MUST remain responsive with screenshots

For Week 6 Success:
- Screen streaming MUST not block monitoring
- Remote control MUST be accurate and responsive
- Admin authorization MUST work reliably
- One-at-a-time enforcement MUST be bulletproof
- Emergency stop MUST always work
- All sessions MUST be logged
- Demo MUST be impressive and smooth

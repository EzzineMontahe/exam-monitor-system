# USE_CASES.md
Project: Exam Monitoring System

Purpose:
This document defines the behavioral flows of the system.
It describes how components interact in real execution scenarios.
AI agents and developers must follow these flows strictly.

------------------------------------------------------------
ACTORS
------------------------------------------------------------

1) Student
2) Instructor
3) Backend System
4) Database

------------------------------------------------------------
USE CASE 1: STUDENT REGISTRATION (Optional)
------------------------------------------------------------

Actor: Instructor or Admin

Flow:
1. Instructor sends POST /auth/register.
2. Backend validates role and input.
3. Password is hashed.
4. User stored in database.
5. Backend returns success message.

Constraints:
- Role must be either "student" or "instructor".
- Password must never be stored in plain text.

Expected Outcome:
New user exists in Users table.

------------------------------------------------------------
USE CASE 2: STUDENT LOGIN FLOW
------------------------------------------------------------

Actor: Student (Desktop App)

Flow:
1. Student opens desktop client.
2. Student enters username/password.
3. Desktop sends POST /auth/login.
4. Backend validates credentials.
5. Backend generates JWT (expires).
6. Desktop receives:
    - access_token
    - role
7. Desktop stores token in memory.
8. Desktop transitions to monitoring state.

Failure Scenarios:
- Invalid credentials → 401.
- Server unreachable → handled gracefully.
- Token missing role → reject.

Security:
- JWT must expire.
- Password comparison must use hashing.

Expected Outcome:
Student authenticated and ready to connect WebSocket.

------------------------------------------------------------
USE CASE 3: INSTRUCTOR LOGIN FLOW
------------------------------------------------------------

Actor: Instructor (Web Dashboard)

Flow:
1. Instructor opens login page.
2. Submits credentials.
3. Frontend sends POST /auth/login.
4. Backend returns JWT.
5. Frontend stores JWT.
6. Redirect to dashboard.
7. Dashboard validates token before rendering.

Failure:
- If token expired → redirect to login.

Expected Outcome:
Instructor authenticated and dashboard accessible.

------------------------------------------------------------
USE CASE 4: STUDENT WEBSOCKET CONNECTION
------------------------------------------------------------

Actor: Desktop Client

Flow:
1. Desktop opens WebSocket connection:
   ws://server/ws?token=JWT
2. Backend extracts token.
3. Backend validates JWT.
4. Backend verifies role = student.
5. Backend registers student in active connections list.
6. Backend initializes risk score (0).
7. Backend logs connection event.
8. Desktop enters active monitoring loop.

Failure:
- Invalid token → connection rejected.
- Expired token → connection rejected.

Expected Outcome:
Student marked as ONLINE in system with initial risk score.

------------------------------------------------------------
USE CASE 5: HEARTBEAT MONITORING
------------------------------------------------------------

Actor: Desktop Client

Flow:
1. Every 5 seconds:
   Desktop sends:
   {
     "event_type": "HEARTBEAT",
     "student_id": X,
     "timestamp": ISO_STRING
   }
2. Backend validates payload.
3. Backend updates last_seen timestamp.
4. If no heartbeat > defined threshold:
   Student marked OFFLINE.

Expected Outcome:
Instructor dashboard reflects real-time online status.

------------------------------------------------------------
USE CASE 6: BLACKLIST ENFORCEMENT FLOW
------------------------------------------------------------

Actor: Instructor + Desktop

Instructor Flow:
1. Instructor sends POST /blacklist.
2. Backend stores blacklist item.
3. Backend returns success.
4. Backend broadcasts blacklist update notification.

Desktop Flow:
1. On startup:
   Desktop fetches GET /blacklist.
2. Desktop stores blacklist locally.
3. On notification:
   Desktop refreshes blacklist.
4. Monitoring loop compares running processes to blacklist.
5. If match detected:
   Trigger violation event.

Expected Outcome:
Blacklisted applications are detected locally.

------------------------------------------------------------
USE CASE 7: VIOLATION DETECTION WITH SCREENSHOT
------------------------------------------------------------

Actor: Desktop

Trigger:
- Blacklisted application detected.
- Suspicious window title detected.
- Other rule violation.

Flow:
1. Desktop detects violation.
2. Desktop captures screenshot immediately:
   - Capture full screen
   - Compress to JPEG (60% quality)
   - Convert to base64
   - Validate size < 1 MB
3. Desktop constructs JSON:
   {
     "event_type": "BLACKLIST_APP",
     "student_id": X,
     "application_name": "chrome.exe",
     "timestamp": ISO_STRING,
     "screenshot": {
       "data": "BASE64_IMAGE",
       "trigger_type": "VIOLATION"
     }
   }
4. Desktop sends via WebSocket.
5. Backend validates structure and image.
6. Backend saves screenshot to file system.
7. Backend stores event in MonitoringEvents table with screenshot_id.
8. Backend updates student risk score (+20).
9. Backend broadcasts violation to instructors.

Failure Scenarios:
- Screenshot capture fails → send violation without screenshot
- Image too large → compress further or skip
- Network timeout → queue for retry

Expected Outcome:
Violation stored with screenshot evidence, instructor alerted.

------------------------------------------------------------
USE CASE 8: WINDOW TITLE TRACKING
------------------------------------------------------------

Actor: Desktop

Trigger:
- Window focus changes

Flow:
1. Desktop detects window focus change.
2. Desktop captures:
   - Process name
   - Window title
   - Start time
3. When window loses focus:
   Desktop calculates duration.
4. Desktop analyzes window title for keywords:
   - "google", "chat", "answer", "cheat"
5. If suspicious:
   Desktop sends:
   {
     "event_type": "WINDOW_FOCUS",
     "student_id": X,
     "application_name": "chrome.exe",
     "window_title": "Google - How to solve...",
     "duration_seconds": 45,
     "timestamp": ISO_STRING
   }
6. Backend validates and stores.
7. Backend analyzes title for suspicious patterns.
8. If suspicious:
   Backend increases risk score (+10).
   Backend broadcasts suspicious window alert.

Expected Outcome:
Suspicious window usage tracked and flagged.

------------------------------------------------------------
USE CASE 9: RISK SCORE CALCULATION
------------------------------------------------------------

Actor: Backend

Trigger:
- Any monitoring event received

Flow:
1. Backend receives event.
2. Backend loads current risk score.
3. Backend applies scoring rules:
   - BLACKLIST_APP: +20
   - SUSPICIOUS_WINDOW: +10
   - RAPID_WINDOW_SWITCH: +5 each
   - LONG_IDLE: +15
4. Backend applies decay:
   - -1 point per 2 minutes of good behavior
5. Backend caps score at 100.
6. Backend determines risk level:
   - 0-30: LOW
   - 31-60: MEDIUM
   - 61-100: HIGH
7. If risk level changed:
   Backend broadcasts risk update.
8. If risk score > 60:
   Backend triggers automatic screenshot request.

Expected Outcome:
Student risk score reflects current behavior accurately.

------------------------------------------------------------
USE CASE 10: MANUAL SCREENSHOT REQUEST
------------------------------------------------------------

Actor: Instructor

Trigger:
- Instructor clicks "Request Screenshot" button

Flow:
1. Frontend sends POST /screenshots/request.
2. Backend validates instructor role.
3. Backend generates request_id.
4. Backend sends WebSocket message to student:
   {
     "type": "SCREENSHOT_REQUEST",
     "request_id": "abc123",
     "reason": "Manual instructor request"
   }
5. Desktop receives request.
6. Desktop captures screenshot.
7. Desktop sends response:
   {
     "event_type": "SCREENSHOT_RESPONSE",
     "student_id": X,
     "request_id": "abc123",
     "screenshot": {
       "data": "BASE64_IMAGE",
       "trigger_type": "MANUAL_REQUEST"
     },
     "timestamp": ISO_STRING
   }
8. Backend receives and stores screenshot.
9. Backend broadcasts screenshot availability.
10. Frontend displays screenshot to instructor.

Failure Scenarios:
- Student offline → return error
- Screenshot timeout (30s) → notify instructor
- Network failure → retry once

Expected Outcome:
Instructor receives screenshot within 5 seconds.

------------------------------------------------------------
USE CASE 11: REAL-TIME DASHBOARD UPDATE
------------------------------------------------------------

Actor: Instructor Dashboard

Flow:
1. Frontend connects to WebSocket.
2. Receives violation broadcast:
   {
     "type": "NEW_VIOLATION",
     "data": {
       "student_id": 1,
       "username": "student1",
       "event_type": "BLACKLIST_APP",
       "application_name": "chrome.exe",
       "timestamp": "2026-03-01T10:45:00",
       "screenshot_id": 5,
       "risk_score": 45
     }
   }
3. Frontend updates violations table dynamically.
4. Frontend highlights new violation visually.
5. Frontend shows "Screenshot available" indicator.
6. Frontend updates risk score badge.

Expected Outcome:
Instructor sees violation instantly with evidence indicator.

------------------------------------------------------------
USE CASE 12: VIEW SCREENSHOT EVIDENCE
------------------------------------------------------------

Actor: Instructor

Flow:
1. Instructor clicks on violation with screenshot.
2. Frontend requests GET /screenshots/{screenshot_id}.
3. Backend validates instructor role.
4. Backend returns screenshot metadata.
5. Frontend displays thumbnail.
6. Instructor clicks to enlarge.
7. Frontend requests GET /screenshots/download/{screenshot_id}.
8. Backend streams image data.
9. Frontend displays full-size image in modal.
10. Backend logs screenshot access.

Expected Outcome:
Instructor views screenshot evidence linked to violation.

------------------------------------------------------------
USE CASE 13: VIEW MONITORING HISTORY
------------------------------------------------------------

Actor: Instructor

Flow:
1. Instructor sends GET /monitoring/events?student_id=X
2. Backend validates instructor role.
3. Backend queries DB with joins:
   - MonitoringEvents
   - Screenshots (if available)
   - RiskScores
4. Returns JSON list with all data.
5. Frontend renders history table with:
   - Event type
   - Timestamp
   - Application/window
   - Screenshot thumbnail (if available)
   - Risk score at that time
6. Instructor can filter by event type.
7. Instructor can click screenshots to view.

Expected Outcome:
Instructor can review complete audit trail with evidence.

------------------------------------------------------------
USE CASE 14: STUDENT DISCONNECT
------------------------------------------------------------

Trigger:
- Desktop closes
- Network failure
- Token expiration

Flow:
1. WebSocket disconnect event triggered.
2. Backend removes student from active list.
3. Backend finalizes risk score.
4. Backend broadcasts OFFLINE status.
5. Dashboard updates student status.
6. Backend logs disconnect event.

Expected Outcome:
Instructor sees student offline in real time.

------------------------------------------------------------
USE CASE 15: SUSPICIOUS BEHAVIOR PATTERN DETECTION
------------------------------------------------------------

Actor: Backend

Trigger:
- Multiple window switches in short time

Flow:
1. Backend receives multiple WINDOW_FOCUS events.
2. Backend detects pattern:
   - 8+ window switches in 30 seconds
3. Backend constructs behavior analysis.
4. Backend increases risk score (+15).
5. Backend triggers automatic screenshot.
6. Backend broadcasts:
   {
     "type": "SUSPICIOUS_BEHAVIOR",
     "data": {
       "student_id": 1,
       "behavior_type": "RAPID_WINDOW_SWITCH",
       "details": "8 switches in 20 seconds",
       "risk_score": 65
     }
   }
7. Instructor dashboard highlights student.

Expected Outcome:
Pattern-based violations detected automatically.

------------------------------------------------------------
SYSTEM-WIDE INVARIANTS
------------------------------------------------------------

- Desktop never communicates directly with frontend.
- All authentication uses JWT.
- Backend is the only source of truth.
- All monitoring events must be validated.
- No silent failures.
- All JSON structures must match API_CONTRACT.
- Screenshots only captured when triggered.
- Screenshot capture never blocks monitoring loop.
- Risk scores must be calculated consistently.
- All screenshots must be linked to events.
- Screenshots must be stored securely.
- Screenshot access requires instructor role.

------------------------------------------------------------
FOR AI AGENTS
------------------------------------------------------------

When implementing features:
- Follow these behavioral flows strictly.
- Do not invent alternative flows.
- If uncertain, align implementation with defined use cases.
- Maintain consistency across backend, desktop, and frontend.
- Always implement screenshot capture on separate thread.
- Always validate screenshot size before transmission.
- Always link screenshots to triggering events.
- Always update risk scores after events.

------------------------------------------------------------
USE CASE 16: INSPECTION MODE (LIVE SCREEN VIEWING)
------------------------------------------------------------

Actor: Instructor

Trigger:
- High-risk student detected
- Instructor wants to verify behavior
- Suspicious violations need investigation

Flow:
1. Instructor identifies student to inspect (e.g., Charlie with risk score 65)
2. Instructor clicks [Watch] button next to Charlie
3. Frontend sends POST /inspection/start {student_id: Charlie}
4. Backend validates:
   - Instructor role confirmed
   - No other inspection active for this instructor
5. Backend creates inspection session
6. Backend sends START_STREAMING WebSocket message to Charlie's desktop
7. Charlie's desktop:
   - Starts screen capture (5 FPS)
   - Optionally shows notification "Being watched"
   - Captures screen every 200ms
   - Compresses to JPEG (30% quality)
   - Converts to base64
   - Sends SCREEN_FRAME via WebSocket
8. Backend relays frames to instructor
9. Instructor's dashboard:
   - Opens full-screen inspection modal
   - Renders frames on canvas element
   - Shows real-time info (active window, apps running)
   - Disables all other [Watch] buttons (can't inspect others)
10. Instructor observes Charlie using ChatGPT
11. Instructor clicks [Screenshot] to capture evidence
12. Instructor clicks [End Inspection]
13. Backend stops streaming
14. Desktop stops capture
15. Session logged with duration and screenshots

Constraints:
- Only ONE student viewable at a time per instructor
- Must close current inspection before starting new one
- Maximum session duration: 10 minutes (auto-disconnect)
- Frame rate: 5-10 FPS (configurable)
- Frame size: < 100 KB per frame

Failure Scenarios:
- Student offline → Error: "Student not connected"
- Another inspection active → Error: "Close current inspection first"
- Network issues → Frames dropped (continue streaming)

Expected Outcome:
- Instructor observes student's screen live
- Evidence captured if needed
- All inspection sessions logged for audit

------------------------------------------------------------
USE CASE 17: INTERACTIVE MODE (REMOTE CONTROL)
------------------------------------------------------------

Actor: Instructor

Trigger:
- Student's exam software frozen
- Need to close forbidden app remotely
- Investigate cheating hands-on
- Technical support needed

Flow:
1. Student (Alice) reports exam software frozen
2. Instructor clicks [Control] button next to Alice
3. Authorization dialog appears
4. Instructor enters:
   - Admin password
   - Reason: "Technical assistance - frozen exam"
5. Frontend sends POST /control/start with credentials
6. Backend validates:
   - Instructor role
   - Admin password correct
   - No other control session active for this instructor
7. Backend creates control session
8. Backend sends START_CONTROL to Alice's desktop
9. Alice's desktop:
   - Blocks local input (mouse/keyboard disabled)
   - Shows full-screen notification: "Instructor controlling your computer"
   - Starts streaming screen to instructor
   - Listens for remote commands
10. Instructor's dashboard:
    - Opens control interface (full-screen)
    - Shows Alice's screen live
    - Captures instructor's mouse/keyboard
    - Disables all other [Control] buttons
11. Instructor moves mouse on control canvas
12. Frontend sends MOUSE_MOVE command to backend
13. Backend relays to Alice's desktop
14. Alice's desktop moves cursor (shows red cursor)
15. Instructor navigates to frozen exam.exe
16. Right-clicks → selects "Restart application"
17. All actions sent as commands and executed
18. Problem resolved - exam software restarted
19. Instructor clicks [Exit Control]
20. Backend sends STOP_CONTROL
21. Alice's desktop:
    - Unblocks local input
    - Removes notification
    - Stops streaming
22. Session logged with all 42 actions performed

Constraints:
- Only ONE student controllable at a time per instructor
- Admin password required (not just instructor login)
- Student MUST be notified (cannot be silent)
- Maximum session duration: 5 minutes (auto-disconnect)
- Limited permissions (cannot access personal files)
- Rate limit: Max 100 commands per second
- Student can emergency stop: CTRL+ALT+SHIFT+E

Failure Scenarios:
- Invalid admin password → 401 Unauthorized
- Student offline → Error: "Student not connected"
- Another control active → Error: "Close current session first"
- Emergency stop triggered → Session ends immediately

Expected Outcome:
- Instructor successfully controls student's computer
- Technical issue resolved remotely
- All actions logged in control_actions table
- Student regains control after session ends

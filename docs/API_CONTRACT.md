Project: Exam Monitoring System

All endpoints return JSON.
All endpoints (except login/register) require JWT.

------------------------------------------------------------
1. AUTHENTICATION
------------------------------------------------------------

POST /auth/register

Request:
{
  "username": "student1",
  "password": "password123",
  "role": "student"
}

Response:
{
  "message": "User created successfully"
}

------------------------------------------------------------

POST /auth/login

Request:
{
  "username": "student1",
  "password": "password123"
}

Response:
{
  "access_token": "JWT_TOKEN_HERE",
  "token_type": "bearer",
  "role": "student"
}

Errors:
401 -> Invalid credentials

------------------------------------------------------------
2. BLACKLIST
------------------------------------------------------------

GET /blacklist

Headers:
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "name": "chrome.exe",
    "type": "APPLICATION"
  }
]

------------------------------------------------------------

POST /blacklist

Request:
{
  "name": "chrome.exe",
  "type": "APPLICATION"
}

Response:
{
  "message": "Blacklist item added"
}

------------------------------------------------------------
3. MONITORING EVENTS (REST history)
------------------------------------------------------------

GET /monitoring/events?student_id=1

Response:
[
  {
    "id": 12,
    "student_id": 1,
    "event_type": "BLACKLIST_APP",
    "application_name": "chrome.exe",
    "window_title": null,
    "timestamp": "2026-03-01T10:45:00",
    "screenshot_id": 5,
    "risk_score": 45
  },
  {
    "id": 13,
    "student_id": 1,
    "event_type": "WINDOW_FOCUS",
    "application_name": "chrome.exe",
    "window_title": "Google - Search results",
    "duration_seconds": 45,
    "timestamp": "2026-03-01T10:46:00",
    "screenshot_id": null,
    "risk_score": 45
  }
]

------------------------------------------------------------
4. RISK SCORES
------------------------------------------------------------

GET /monitoring/risk-scores

Response:
[
  {
    "student_id": 1,
    "username": "student1",
    "risk_score": 45,
    "risk_level": "MEDIUM",
    "violation_count": 2,
    "window_switch_count": 15,
    "suspicious_window_count": 3,
    "last_updated": "2026-03-01T10:50:00"
  }
]

------------------------------------------------------------

GET /monitoring/risk-scores/{student_id}

Response:
{
  "student_id": 1,
  "username": "student1",
  "risk_score": 45,
  "risk_level": "MEDIUM",
  "violation_count": 2,
  "window_switch_count": 15,
  "suspicious_window_count": 3,
  "last_updated": "2026-03-01T10:50:00",
  "recent_events": [
    {
      "event_type": "BLACKLIST_APP",
      "timestamp": "2026-03-01T10:45:00"
    }
  ]
}

------------------------------------------------------------
5. SCREENSHOTS
------------------------------------------------------------

GET /screenshots/{screenshot_id}

Headers:
Authorization: Bearer <token>

Response:
{
  "id": 5,
  "student_id": 1,
  "event_id": 12,
  "trigger_type": "VIOLATION",
  "file_url": "/screenshots/download/5",
  "captured_at": "2026-03-01T10:45:00",
  "thumbnail_url": "/screenshots/thumbnail/5"
}

------------------------------------------------------------

GET /screenshots/download/{screenshot_id}

Headers:
Authorization: Bearer <token>

Response:
Binary image data (image/jpeg)

Notes:
- Instructor role required
- Returns 403 if student tries to access
- Returns 404 if screenshot not found

------------------------------------------------------------

GET /screenshots/student/{student_id}

Headers:
Authorization: Bearer <token>

Response:
[
  {
    "id": 5,
    "event_id": 12,
    "trigger_type": "VIOLATION",
    "file_url": "/screenshots/download/5",
    "captured_at": "2026-03-01T10:45:00",
    "thumbnail_url": "/screenshots/thumbnail/5"
  }
]

Notes:
- Returns all screenshots for a specific student
- Instructor role required

------------------------------------------------------------

POST /screenshots/request

Request:
{
  "student_id": 1
}

Response:
{
  "message": "Screenshot requested",
  "request_id": "abc123"
}

Notes:
- Instructor role required
- Triggers screenshot capture on student's desktop
- Screenshot delivered via WebSocket when ready

------------------------------------------------------------
6. WEBSOCKET
------------------------------------------------------------

Endpoint:
ws://localhost:8000/ws?token=JWT_TOKEN

------------------------------------------------------------
6.1 Desktop → Backend Messages
------------------------------------------------------------

Heartbeat:
{
  "event_type": "HEARTBEAT",
  "student_id": 1,
  "timestamp": "2026-03-01T10:45:00"
}

------------------------------------------------------------

Violation (with screenshot):
{
  "event_type": "BLACKLIST_APP",
  "student_id": 1,
  "application_name": "chrome.exe",
  "timestamp": "2026-03-01T10:45:00",
  "screenshot": {
    "data": "BASE64_ENCODED_IMAGE",
    "trigger_type": "VIOLATION"
  }
}

------------------------------------------------------------

Window Focus Event:
{
  "event_type": "WINDOW_FOCUS",
  "student_id": 1,
  "application_name": "chrome.exe",
  "window_title": "Google - How to cheat",
  "duration_seconds": 30,
  "timestamp": "2026-03-01T10:45:00"
}

------------------------------------------------------------

Suspicious Behavior:
{
  "event_type": "SUSPICIOUS_BEHAVIOR",
  "student_id": 1,
  "behavior_type": "RAPID_WINDOW_SWITCH",
  "details": "8 window switches in 20 seconds",
  "timestamp": "2026-03-01T10:45:00"
}

------------------------------------------------------------

Screenshot Response (to manual request):
{
  "event_type": "SCREENSHOT_RESPONSE",
  "student_id": 1,
  "request_id": "abc123",
  "screenshot": {
    "data": "BASE64_ENCODED_IMAGE",
    "trigger_type": "MANUAL_REQUEST"
  },
  "timestamp": "2026-03-01T10:45:00"
}

------------------------------------------------------------
6.2 Backend → Instructor Messages
------------------------------------------------------------

New Violation Broadcast:
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

------------------------------------------------------------

Risk Score Update:
{
  "type": "RISK_SCORE_UPDATE",
  "data": {
    "student_id": 1,
    "username": "student1",
    "risk_score": 45,
    "risk_level": "MEDIUM",
    "previous_score": 35
  }
}

------------------------------------------------------------

Student Status Update:
{
  "type": "STUDENT_STATUS",
  "data": {
    "student_id": 1,
    "username": "student1",
    "status": "ONLINE",
    "last_seen": "2026-03-01T10:45:00"
  }
}

------------------------------------------------------------

Screenshot Available:
{
  "type": "SCREENSHOT_AVAILABLE",
  "data": {
    "screenshot_id": 5,
    "student_id": 1,
    "event_id": 12,
    "trigger_type": "VIOLATION",
    "thumbnail_url": "/screenshots/thumbnail/5"
  }
}

------------------------------------------------------------

Suspicious Window Alert:
{
  "type": "SUSPICIOUS_WINDOW",
  "data": {
    "student_id": 1,
    "username": "student1",
    "window_title": "ChatGPT - Math solver",
    "application_name": "chrome.exe",
    "risk_score": 55
  }
}

------------------------------------------------------------
6.3 Backend → Desktop Messages
------------------------------------------------------------

Screenshot Request:
{
  "type": "SCREENSHOT_REQUEST",
  "request_id": "abc123",
  "reason": "Manual instructor request"
}

------------------------------------------------------------

Blacklist Update Notification:
{
  "type": "BLACKLIST_UPDATED",
  "message": "Please refresh blacklist"
}

------------------------------------------------------------
7. ERROR RESPONSE FORMAT
------------------------------------------------------------

All errors must follow:

{
  "error": "Error message",
  "details": "Optional details"
}

Common Error Codes:
- 400: Bad Request (invalid JSON, missing fields)
- 401: Unauthorized (invalid/expired JWT)
- 403: Forbidden (wrong role, e.g., student accessing screenshots)
- 404: Not Found
- 413: Payload Too Large (screenshot > 1 MB)
- 429: Too Many Requests (screenshot rate limit)
- 500: Internal Server Error

------------------------------------------------------------
8. DATA VALIDATION RULES
------------------------------------------------------------

Screenshots:
- Maximum size: 1 MB (base64 encoded)
- Format: JPEG only
- Base64 validation required
- Metadata must include: student_id, trigger_type, timestamp

Window Titles:
- Maximum length: 500 characters
- Must be non-empty string
- Special characters allowed

Event Types (enum):
- HEARTBEAT
- BLACKLIST_APP
- WINDOW_FOCUS
- SUSPICIOUS_BEHAVIOR
- SCREENSHOT_RESPONSE

Trigger Types (enum):
- VIOLATION
- MANUAL_REQUEST
- RANDOM_CHECK
- HIGH_RISK_BEHAVIOR

Risk Levels (enum):
- LOW (0-30)
- MEDIUM (31-60)
- HIGH (61-100)

------------------------------------------------------------
9. RATE LIMITING
------------------------------------------------------------

Screenshots:
- Max 1 screenshot per 30 seconds per student (automatic)
- Max 5 manual screenshot requests per minute per instructor
- Max screenshot size: 1 MB

Window Focus Events:
- Throttled to 1 event per 3 seconds per student

Heartbeat:
- Expected every 5 seconds (±2 seconds tolerance)

------------------------------------------------------------

IMPORTANT RULE:
If any structure changes,
this document must be updated before code changes.

------------------------------------------------------------
10. BACKWARD COMPATIBILITY
------------------------------------------------------------

Old clients without screenshot support:
- Can still send basic monitoring events
- Backend will not expect screenshot field
- Optional screenshot field in all events

Migration path:
- Week 1-4: Basic monitoring only
- Week 5: Add screenshot support
- Old events remain compatible

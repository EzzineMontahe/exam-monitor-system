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
    "timestamp": "2026-03-01T10:45:00"
  }
]

------------------------------------------------------------
4. WEBSOCKET
------------------------------------------------------------

Endpoint:
ws://localhost:8000/ws?token=JWT_TOKEN

WebSocket Event Format (from Desktop):

{
  "event_type": "HEARTBEAT",
  "student_id": 1,
  "timestamp": "2026-03-01T10:45:00"
}

Violation Example:

{
  "event_type": "BLACKLIST_APP",
  "student_id": 1,
  "application_name": "chrome.exe",
  "timestamp": "2026-03-01T10:45:00"
}

Backend → Instructor Dashboard Broadcast:

{
  "type": "NEW_VIOLATION",
  "data": {
    "student_id": 1,
    "event_type": "BLACKLIST_APP",
    "application_name": "chrome.exe",
    "timestamp": "2026-03-01T10:45:00"
  }
}

------------------------------------------------------------
5. ERROR RESPONSE FORMAT
------------------------------------------------------------

All errors must follow:

{
  "error": "Error message",
  "details": "Optional details"
}

------------------------------------------------------------

IMPORTANT RULE:
If any structure changes,
this document must be updated before code changes.

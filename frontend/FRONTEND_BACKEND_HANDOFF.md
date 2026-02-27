# Backend Status Handoff — For Frontend Developer

**Date:** February 27, 2026
**Backend branch:** `backend-dev`
**Backend status:** Weeks 1–5 complete, 96/96 tests passing

---

## What's Built and Ready

The backend has all Weeks 1–5 features fully implemented and tested. Everything listed below is deployed on `backend-dev` and ready for frontend integration.

---

## 1. Authentication (Week 1)

### POST /auth/register
```
Request:
{
  "username": "instructor1",
  "password": "password123",
  "role": "instructor"           // "student" or "instructor"
}

Response (201):
{ "message": "User created successfully" }

Errors:
409 → { "detail": "Username already exists" }
```

### POST /auth/login
```
Request:
{
  "username": "instructor1",
  "password": "password123"
}

Response (200):
{
  "access_token": "JWT_TOKEN_HERE",
  "token_type": "bearer",
  "role": "instructor"
}

Errors:
401 → { "detail": "Invalid credentials" }
```

### Auth Header (all protected endpoints)
```
Authorization: Bearer <access_token>
```

---

## 2. Blacklist CRUD (Week 4) — All Three Endpoints Ready

### GET /blacklist
```
Auth: Any authenticated user (student or instructor)
Response (200):
[
  { "id": 1, "name": "chrome.exe", "type": "APPLICATION" },
  { "id": 2, "name": "chatgpt.com", "type": "WEBSITE" }
]
```

### POST /blacklist
```
Auth: Instructor only (403 if student)
Request:
{
  "name": "chrome.exe",
  "type": "APPLICATION"          // "APPLICATION" or "WEBSITE"
}

Response (201):
{ "message": "Blacklist item added" }

Errors:
409 → { "detail": "Blacklist item already exists" }
403 → { "detail": "Instructor role required" }
```

### DELETE /blacklist/{item_id}
```
Auth: Instructor only (403 if student)
Response (200):
{ "message": "Blacklist item removed" }

Errors:
404 → { "detail": "Blacklist item not found" }
403 → { "detail": "Instructor role required" }
```

> **Side effect:** POST and DELETE both broadcast a `BLACKLIST_UPDATED` WebSocket message to all connected **students** (so they refresh their local blacklist). Currently this is **NOT** sent to instructors. If the frontend dashboard needs to auto-refresh the blacklist on changes from other instructors, let us know and we'll add instructor broadcast too.

---

## 3. Monitoring Events (Week 3)

### GET /monitoring/events?student_id={id}
```
Auth: Instructor only
Query params: student_id (optional — filters by student)

Response (200):
[
  {
    "id": 12,
    "student_id": 1,
    "event_type": "BLACKLIST_APP",
    "application_name": "chrome.exe",
    "window_title": null,
    "duration_seconds": null,
    "timestamp": "2026-03-01T10:45:00",
    "screenshot_id": 5,
    "risk_score": 45
  }
]
```

Event types: `HEARTBEAT`, `BLACKLIST_APP`, `WINDOW_FOCUS`, `SUSPICIOUS_BEHAVIOR`

---

## 4. Risk Scores (Week 5)

### GET /monitoring/risk-scores
```
Auth: Instructor only
Response (200):
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
```

### GET /monitoring/risk-scores/{student_id}
```
Auth: Instructor only
Response (200):
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
```

**Risk levels:**
- `LOW` → 0–30 (green)
- `MEDIUM` → 31–60 (yellow)
- `HIGH` → 61–100 (red)

---

## 5. Screenshots (Week 5)

### GET /screenshots/{screenshot_id}
```
Auth: Instructor only
Response (200):
{
  "id": 5,
  "student_id": 1,
  "event_id": 12,
  "trigger_type": "VIOLATION",
  "file_url": "/screenshots/download/5",
  "captured_at": "2026-03-01T10:45:00",
  "thumbnail_url": "/screenshots/thumbnail/5"
}
```

### GET /screenshots/download/{screenshot_id}
```
Auth: Instructor only
Response: Binary JPEG image (Content-Type: image/jpeg)

Errors:
404 → screenshot not found or file missing
403 → not instructor
```

### GET /screenshots/thumbnail/{screenshot_id}
```
Auth: Instructor only
Response: Binary JPEG thumbnail (Content-Type: image/jpeg)
Note: Currently returns the full image (placeholder — real resizing coming later)

Errors:
404 → screenshot not found
403 → not instructor
```

### GET /screenshots/student/{student_id}
```
Auth: Instructor only
Response (200):
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
```

### POST /screenshots/request
```
Auth: Instructor only
Request:
{ "student_id": 1 }

Response (200):
{
  "message": "Screenshot requested",
  "request_id": "abc123-uuid-here"
}

Errors:
400 → student not connected
403 → not instructor
429 → rate limit exceeded (max 5 requests/min per instructor)
```

**Trigger types:** `VIOLATION`, `MANUAL_REQUEST`, `RANDOM_CHECK`, `HIGH_RISK_BEHAVIOR`

---

## 6. WebSocket — Instructor Connection

### Connection
```
ws://localhost:8000/ws?token=<JWT_TOKEN>
```

Token must be a valid instructor JWT passed as query parameter. Invalid/expired tokens cause immediate disconnect.

### Messages the Frontend Will Receive (Backend → Instructor)

#### CONNECTED_STUDENTS_LIST (sent immediately on connect)
```json
{
  "type": "CONNECTED_STUDENTS_LIST",
  "data": [
    {
      "student_id": 1,
      "username": "student1",
      "status": "ONLINE",
      "last_seen": "2026-03-01T10:45:00"
    }
  ]
}
```

#### STUDENT_STATUS (when a student connects/disconnects)
```json
{
  "type": "STUDENT_STATUS",
  "data": {
    "student_id": 1,
    "username": "student1",
    "status": "ONLINE",
    "last_seen": "2026-03-01T10:45:00"
  }
}
```

#### NEW_VIOLATION (blacklisted app detected)
```json
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
```

#### SUSPICIOUS_WINDOW (suspicious window title detected)
```json
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
```

#### RISK_SCORE_UPDATE (score changed for a student)
```json
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
```

#### SCREENSHOT_AVAILABLE (new screenshot stored, ready to view)
```json
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
```

> **Note:** `BLACKLIST_UPDATED` is currently only sent to students. Instructors do NOT receive it. If the frontend needs this notification (e.g., for multi-instructor blacklist sync), tell the backend team.

---

## 7. Error Response Format

All errors follow this pattern:
```json
{
  "detail": "Error message here"
}
```

Common HTTP status codes:
| Code | Meaning |
|------|---------|
| 400 | Bad request / invalid input |
| 401 | Invalid or expired JWT |
| 403 | Wrong role (e.g., student accessing instructor-only endpoint) |
| 404 | Resource not found |
| 409 | Conflict (duplicate blacklist item, duplicate username) |
| 429 | Rate limit exceeded |

---

## 8. Quick Integration Checklist for Frontend

### Login Flow
1. POST `/auth/login` with credentials
2. Store `access_token` and `role` from response
3. Use `Authorization: Bearer <token>` on all subsequent requests
4. If any request returns 401, redirect to login

### WebSocket Flow
1. After login, connect: `ws://localhost:8000/ws?token=<access_token>`
2. On connect, you'll receive `CONNECTED_STUDENTS_LIST`
3. Listen for `STUDENT_STATUS`, `NEW_VIOLATION`, `SUSPICIOUS_WINDOW`, `RISK_SCORE_UPDATE`, `SCREENSHOT_AVAILABLE`
4. Parse `type` field to route messages to the right handler

### Student Dashboard
1. GET `/monitoring/risk-scores` for all students' risk overview
2. Use WS `RISK_SCORE_UPDATE` messages to update scores in real-time
3. Color-code: green (LOW 0–30), yellow (MEDIUM 31–60), red (HIGH 61–100)

### Violations
1. Listen for `NEW_VIOLATION` on WS for real-time alerts
2. GET `/monitoring/events?student_id=X` for history
3. If `screenshot_id` is not null, show "Screenshot available" indicator

### Screenshots
1. When violation has a `screenshot_id`, fetch thumbnail: GET `/screenshots/thumbnail/{id}`
2. Click to enlarge: GET `/screenshots/download/{id}` (returns raw JPEG)
3. List all for a student: GET `/screenshots/student/{student_id}`
4. Manual request: POST `/screenshots/request` with `{ "student_id": X }`
5. Listen for `SCREENSHOT_AVAILABLE` on WS to know when new screenshots arrive

### Blacklist Management
1. GET `/blacklist` to populate the list
2. POST `/blacklist` to add items (`{ "name": "...", "type": "APPLICATION" | "WEBSITE" }`)
3. DELETE `/blacklist/{id}` to remove items
4. Currently no WS notification to instructors — poll on page load or after your own mutations

---

## 9. What's NOT Built Yet (Week 6 — Coming Next)

These endpoints/features are defined in the API contract but **not yet implemented**:

| Feature | Endpoints | Status |
|---------|-----------|--------|
| Inspection Mode (live screen viewing) | `POST /inspection/start`, `POST /inspection/stop`, `GET /inspection/history` | Not started |
| Interactive Mode (remote control) | `POST /control/start`, `POST /control/stop`, `GET /control/history`, `GET /control/actions/{session_id}` | Not started |
| WS: `SCREEN_FRAME` relay | Inspection mode frame streaming | Not started |
| WS: `REMOTE_COMMAND` relay | Interactive mode command relay | Not started |

**Week 6 WS message types** (will be added):
- `START_STREAMING` / `STOP_STREAMING` (Backend → Desktop)
- `SCREEN_FRAME` (Backend → Instructor, relayed from Desktop)
- `START_CONTROL` / `STOP_CONTROL` (Backend → Desktop)
- `REMOTE_COMMAND` (Backend → Desktop, from Instructor)
- `COMMAND_EXECUTED` / `EMERGENCY_STOP` (Desktop → Backend)

The frontend can start building the UI for these in parallel — the REST endpoints and WS message shapes are already defined in `API_CONTRACT.md` sections 6.4, 6.5, 11, and 12.

---

## 10. Development Setup

```bash
cd backend
py -3.11 -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install -r requirements-dev.txt
python scripts/init_db.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Swagger UI:** http://127.0.0.1:8000/docs
- **Health check:** http://127.0.0.1:8000/health
- CORS is currently `allow_origins=["*"]` for development

---

## 11. Key Things to Know

1. **Screenshot URLs are relative** — `file_url` and `thumbnail_url` return paths like `/screenshots/download/5`. Prepend the base URL (e.g., `http://localhost:8000`) on the frontend.

2. **Risk scores are calculated server-side** — The frontend only needs to display them. Scores update in real-time via the `RISK_SCORE_UPDATE` WS message.

3. **BLACKLIST_UPDATED WS goes to students only** — If you need instructor notification for multi-instructor sync, let us know. Current design assumes one instructor manages the blacklist.

4. **Screenshot rate limits** — Manual requests: max 5 per minute per instructor. If you hit 429, show a "please wait" message.

5. **WebSocket reconnection** — If the WS drops, reconnect with the same JWT. You'll get a fresh `CONNECTED_STUDENTS_LIST` on reconnect.

6. **All timestamps** are ISO 8601 strings (e.g., `"2026-03-01T10:45:00"`).

---

## 12. Reference Documents

| Document | What it covers |
|----------|---------------|
| `docs/API_CONTRACT.md` | Complete endpoint specs, all request/response shapes, WS message formats |
| `docs/ARCHITECTURE.md` | System design, data flow, component responsibilities, Week 6 architecture |
| `docs/USE_CASES.md` | Behavioral flows for every feature (login, violations, screenshots, inspection, control) |
| `docs/WEEK_OBJECTIVES.md` | Week-by-week deliverables for all three roles |
| `docs/AI_PROJECT_CONTEXT.md` | Project overview, rules, constraints, performance requirements |
| `docs/AI_IMPLEMENTATION_GUIDE.md` | Code patterns, DB schema, implementation checklists |

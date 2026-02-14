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
6. Backend logs connection event.
7. Desktop enters active monitoring loop.

Failure:
- Invalid token → connection rejected.
- Expired token → connection rejected.

Expected Outcome:
Student marked as ONLINE in system.

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

Desktop Flow:
1. On startup:
   Desktop fetches GET /blacklist.
2. Desktop stores blacklist locally.
3. Monitoring loop compares running processes to blacklist.
4. If match detected:
   Trigger violation event.

Expected Outcome:
Blacklisted applications are detected locally.

------------------------------------------------------------
USE CASE 7: VIOLATION DETECTION FLOW
------------------------------------------------------------

Actor: Desktop

Trigger:
- Blacklisted application detected.
- Suspicious window title detected (optional).
- Other rule violation.

Flow:
1. Desktop constructs JSON:
   {
     "event_type": "BLACKLIST_APP",
     "student_id": X,
     "application_name": "...",
     "timestamp": ISO_STRING
   }
2. Desktop sends via WebSocket.
3. Backend validates structure.
4. Backend stores in MonitoringEvents table.
5. Backend broadcasts to instructors.

Expected Outcome:
Violation stored and displayed in dashboard.

------------------------------------------------------------
USE CASE 8: REAL-TIME DASHBOARD UPDATE
------------------------------------------------------------

Actor: Instructor Dashboard

Flow:
1. Frontend connects to WebSocket.
2. Receives broadcast:
   {
     "type": "NEW_VIOLATION",
     "data": {...}
   }
3. Frontend updates violations table dynamically.
4. Frontend highlights new violation visually.

Expected Outcome:
Instructor sees violation instantly.

------------------------------------------------------------
USE CASE 9: VIEW MONITORING HISTORY
------------------------------------------------------------

Actor: Instructor

Flow:
1. Instructor sends GET /monitoring/events?student_id=X
2. Backend validates instructor role.
3. Backend queries DB.
4. Returns JSON list.
5. Frontend renders history table.

Expected Outcome:
Instructor can review past events.

------------------------------------------------------------
USE CASE 10: STUDENT DISCONNECT
------------------------------------------------------------

Trigger:
- Desktop closes
- Network failure
- Token expiration

Flow:
1. WebSocket disconnect event triggered.
2. Backend removes student from active list.
3. Backend broadcasts OFFLINE status.
4. Dashboard updates student status.

Expected Outcome:
Instructor sees student offline in real time.

------------------------------------------------------------
SYSTEM-WIDE INVARIANTS
------------------------------------------------------------

- Desktop never communicates directly with frontend.
- All authentication uses JWT.
- Backend is the only source of truth.
- All monitoring events must be validated.
- No silent failures.
- All JSON structures must match API_CONTRACT.

------------------------------------------------------------
FOR AI AGENTS
------------------------------------------------------------

When implementing features:
- Follow these behavioral flows strictly.
- Do not invent alternative flows.
- If uncertain, align implementation with defined use cases.
- Maintain consistency across backend, desktop, and frontend.

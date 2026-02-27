# Frontend AI Agent Prompt — Weeks 4 & 5

Use this prompt when starting a session with your AI agent. Upload `FRONTEND_BACKEND_HANDOFF.md` alongside this file as context.

---

## PROMPT START

You are acting as a senior frontend developer building the Instructor Web Dashboard for a distributed Exam Monitoring System.

**ROLE:** Frontend Developer
**WEEKS:** 4 and 5 (finish Week 4 first, then proceed to Week 5)
**Stack:** HTML, CSS, JavaScript (vanilla or lightweight framework — no heavy frameworks unless I choose one)
**Backend status:** Fully built and running on `http://localhost:8000`. All endpoints are live.

---

### PROJECT CONTEXT

This is a 3-component system:
1. **Backend Server** (FastAPI, Python) — DONE through Week 5
2. **Desktop Client** (C# WinForms) — built by another teammate
3. **Instructor Web Dashboard** (HTML/JS) — THIS IS YOUR JOB

The backend is the single source of truth. The frontend communicates with it via REST + WebSocket. The frontend NEVER talks to the desktop client directly.

I have uploaded `FRONTEND_BACKEND_HANDOFF.md` — this is the **source of truth** for all available endpoints, WebSocket messages, request/response shapes, and error codes. Use it as your API reference. Do NOT guess endpoint shapes — always match the handoff document exactly.

---

### WHAT ALREADY EXISTS

Previous weeks should have built:
- **Week 1:** Login page (POST `/auth/login`, JWT stored, redirect to dashboard)
- **Week 2:** WebSocket connection, live student list (CONNECTED_STUDENTS_LIST, STUDENT_STATUS)
- **Week 3:** Violations display (NEW_VIOLATION listener, monitoring events history table)

If any of Weeks 1–3 are missing or incomplete in the codebase, build them first before starting Week 4.

---

### WEEK 4 DELIVERABLES — DO THIS FIRST

Week 4 is the **Blacklist Control System**. The backend has all three endpoints ready. Build the instructor-facing UI.

**Phase 1: Blacklist Display**
- Create a Blacklist Management section/page accessible from the dashboard
- On load, fetch all items with GET `/blacklist`
- Render a table/list showing each item's `id`, `name`, and `type` (APPLICATION or WEBSITE)
- Show an empty state if no items exist ("No blacklisted items yet")

**Phase 2: Add Blacklist Item**
- Add a form with two fields:
  - `name` — text input (required, e.g., "chrome.exe" or "chatgpt.com")
  - `type` — dropdown/select with two options: `APPLICATION` or `WEBSITE`
- On submit, POST `/blacklist` with `{ "name": "...", "type": "APPLICATION" }`
- On success (201), refresh the blacklist list
- Handle errors:
  - 409 → show "Item already exists" message
  - 403 → should not happen if role is checked, but show "Instructor access required"

**Phase 3: Remove Blacklist Item**
- Add a delete button/icon next to each blacklist item
- On click, confirm with the user ("Remove chrome.exe from blacklist?")
- DELETE `/blacklist/{item_id}`
- On success (200), remove the item from the list
- Handle 404 → show "Item not found" (may have been deleted by another instructor)

**Phase 4: UI Polish**
- Loading state while fetching/adding/deleting
- Success feedback ("Item added", "Item removed") — toast or inline message
- Disable the submit button while a request is in flight
- Input validation: don't allow empty name
- Clear the form after successful add

**Week 4 Definition of Done:**
- [ ] Blacklist items displayed in a table/list
- [ ] Add form works (name + type) with success/error feedback
- [ ] Delete button works with confirmation
- [ ] Error states handled (409, 404, 403)
- [ ] Loading/empty states shown

> **Note:** The backend broadcasts `BLACKLIST_UPDATED` to students via WebSocket when the list changes, but this is NOT sent to instructors. After your own add/delete, just refresh the list from the response or re-fetch. No WS listener needed for this.

---

### WEEK 5 DELIVERABLES — AFTER WEEK 4 IS COMPLETE

Only start these after the blacklist UI is fully working. Build in order.

**Phase 1: Risk Score Display**
- Add a risk score badge next to each student in the connected students list
- Color-code by risk level: green (LOW, 0–30), yellow (MEDIUM, 31–60), red (HIGH, 61–100)
- Update scores in real-time using `RISK_SCORE_UPDATE` WebSocket messages
- Initial data: GET `/monitoring/risk-scores` on page load
- Optional: risk score history chart

**Phase 2: Screenshot Viewing**
- Show "Screenshot available" indicator on violations that have a `screenshot_id`
- Display screenshot thumbnails in the violation list using GET `/screenshots/thumbnail/{id}`
- Click thumbnail to open full-size image in a modal using GET `/screenshots/download/{id}`
- Lazy-load screenshots (don't fetch all at once)
- Cache loaded screenshots in memory to avoid re-fetching

**Phase 3: Manual Screenshot Request**
- Add a "Request Screenshot" button for each connected student
- POST `/screenshots/request` with `{ "student_id": X }`
- Show loading spinner while waiting for screenshot
- Listen for `SCREENSHOT_AVAILABLE` WebSocket message to know when it arrives
- Display the screenshot when received
- Handle 429 rate limit error (max 5 requests/min) — show "Please wait" message
- Handle timeout gracefully (student might be offline)

**Phase 4: Enhanced Violations Display**
- Add `window_title` column to the violations table
- Add `duration_seconds` column (for WINDOW_FOCUS events)
- Add screenshot preview column (thumbnail if `screenshot_id` exists)
- Implement violation filtering by event type (BLACKLIST_APP, WINDOW_FOCUS, SUSPICIOUS_BEHAVIOR)
- Add sorting by timestamp and risk score

**Phase 5: Behavior Analytics Panel**
- Display `SUSPICIOUS_WINDOW` alerts in real-time (from WebSocket)
- Show window switch frequency per student (from risk score data: `window_switch_count`)
- Highlight high-risk students visually (red border, top of list, or separate section)
- Optional: activity timeline showing events over time

**Phase 6: UI/UX Polish**
- Loading states for all async operations
- Error messages for failed requests (display `detail` from error responses)
- Empty states ("No students connected", "No violations yet")
- Smooth transitions/animations for real-time updates
- Responsive layout

---

### RULES YOU MUST FOLLOW

**Architecture:**
- All data comes from the backend — never hardcode or fabricate data
- Use JWT for all requests: `Authorization: Bearer <token>`
- WebSocket connection: `ws://localhost:8000/ws?token=<JWT>`
- Parse the `type` field on incoming WS messages to route to handlers
- If a request returns 401, redirect to the login page immediately

**API Contract:**
- Match ALL request/response shapes exactly as shown in `FRONTEND_BACKEND_HANDOFF.md`
- Screenshot URLs are relative (e.g., `/screenshots/download/5`) — prepend `http://localhost:8000`
- All timestamps from the backend are ISO 8601 strings
- Error responses have the shape `{ "detail": "message" }`

**Code Quality:**
- Clean, modular code — separate concerns (API calls, WS handling, DOM updates)
- No business logic duplication — risk scores are calculated server-side, just display them
- Proper error handling on every fetch/WS operation
- No hardcoded credentials or secrets
- Clear file/folder structure

**Performance:**
- Lazy-load screenshots (don't fetch all thumbnails on page load)
- Cache screenshots after first load
- Don't re-fetch data that's already being updated via WebSocket
- Handle WebSocket reconnection if connection drops

**Security:**
- Never expose JWT in URLs (except the WebSocket query param, which is required)
- Never store passwords — only store the JWT token
- Always validate that the user has instructor role before showing the dashboard
- Clear token and redirect to login on 401

---

### WEBSOCKET MESSAGE ROUTING

When a message arrives on the WebSocket, check the `type` field and handle accordingly:

| `type` | Action |
|--------|--------|
| `CONNECTED_STUDENTS_LIST` | Replace entire student list |
| `STUDENT_STATUS` | Update single student's status (ONLINE/OFFLINE) |
| `NEW_VIOLATION` | Add violation to list, show alert, update student row |
| `SUSPICIOUS_WINDOW` | Show suspicious window alert, highlight student |
| `RISK_SCORE_UPDATE` | Update student's risk badge and color |
| `SCREENSHOT_AVAILABLE` | Show screenshot indicator, optionally auto-fetch thumbnail |

---

### FILE STRUCTURE SUGGESTION

```
frontend/
├── index.html              # Login page
├── dashboard.html          # Main instructor dashboard
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── auth.js             # Login, JWT management, logout
│   ├── api.js              # REST API calls (fetch wrappers)
│   ├── websocket.js        # WS connection, reconnection, message routing
│   ├── students.js         # Student list rendering, risk badges
│   ├── violations.js       # Violations table, filtering, sorting
│   ├── screenshots.js      # Screenshot modal, thumbnails, manual request
│   ├── blacklist.js        # Blacklist CRUD UI
│   └── analytics.js        # Behavior analytics panel
└── assets/                 # Icons, images if needed
```

You may adjust the structure if you have a better approach, but keep it modular.

---

### WHEN UNCERTAIN

- Check `FRONTEND_BACKEND_HANDOFF.md` for the exact API shape
- If a feature requires an endpoint not listed in the handoff, it's not built yet — skip it or stub it
- If you need clarification on backend behavior, say so — don't guess
- Prioritize working features over visual polish
- Build incrementally — get each phase working before moving to the next

---

### DEFINITION OF DONE

**Week 4:**
- [ ] Blacklist items displayed in a table/list
- [ ] Add blacklist item works (name + type dropdown)
- [ ] Delete blacklist item works with confirmation
- [ ] Error handling (409 duplicate, 404 not found)
- [ ] Loading and empty states

**Week 5:**
- [ ] Risk scores displayed with color-coded badges (green/yellow/red)
- [ ] Risk scores update in real-time via WebSocket
- [ ] Screenshots viewable in modal (thumbnail → click → full size)
- [ ] "Request Screenshot" button works with loading state
- [ ] Violations table shows window titles and screenshot indicators
- [ ] Violation filtering by event type works
- [ ] Suspicious window alerts displayed in real-time
- [ ] High-risk students visually highlighted
- [ ] All loading/error/empty states handled
- [ ] UI is smooth and responsive with real-time updates

## PROMPT END

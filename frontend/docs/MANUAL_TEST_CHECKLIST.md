# Frontend Manual Test Checklist — Week 5

> **Pre-requisites**: Backend running on `localhost:8000`, at least 1 instructor account and 1 student account created, desktop client available (or use backend test tools to simulate WS messages).

---

## 1. Authentication (Week 1)

### 1.1 Login Page (`login.html`)

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 1.1.1 | Valid login | Enter valid instructor credentials → Submit | Redirects to `dashboard.html`, JWT stored in localStorage | ☐ |
| 1.1.2 | Invalid credentials | Enter wrong password → Submit | Error message: "Invalid username or password." | ☐ |
| 1.1.3 | Empty fields | Leave fields blank → Submit | HTML5 required validation prevents submit | ☐ |
| 1.1.4 | Backend down | Stop backend → Submit login | Error: "Unable to connect to server..." | ☐ |
| 1.1.5 | Student role blocked | Login with student account | Should redirect to login (role guard blocks dashboard) | ☐ |

### 1.2 Route Guard

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 1.2.1 | No token | Clear localStorage → Navigate to `dashboard.html` | Redirected to `login.html` | ☐ |
| 1.2.2 | Expired token | Manually set an expired JWT in localStorage → Navigate to `dashboard.html` | Redirected to `login.html` | ☐ |
| 1.2.3 | Wrong role | Set `role=student` in localStorage → Navigate to `dashboard.html` | Redirected to `login.html` | ☐ |

### 1.3 Logout

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 1.3.1 | Logout button | Click "Logout" on dashboard | localStorage cleared, redirected to `login.html`, WebSocket disconnected | ☐ |

---

## 2. WebSocket & Student List (Week 2)

### 2.1 Connection

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 2.1.1 | Auto-connect | Login as instructor | WS indicator shows "Live" (green dot) | ☐ |
| 2.1.2 | Reconnection | Stop backend briefly → Restart | Indicator shows "Reconnecting..." then "Live" | ☐ |
| 2.1.3 | Auth failure | Expire token while connected (backend rejects) | Redirected to login | ☐ |

### 2.2 Student List

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 2.2.1 | Student connects | Connect a student desktop client | Student appears in table as "Online" | ☐ |
| 2.2.2 | Student disconnects | Disconnect desktop client | Student shows "Offline" | ☐ |
| 2.2.3 | Multiple students | Connect 2+ students | All appear, sorted by status then risk | ☐ |
| 2.2.4 | Empty state | No students connected | "No students connected yet." message shown | ☐ |
| 2.2.5 | Stale on disconnect | Disconnect WS (network issue) | Online students show "Stale" status | ☐ |

---

## 3. Violations (Week 3)

### 3.1 Live Violations

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 3.1.1 | New violation | Trigger a blacklist violation from desktop | Row appears at top with flash animation, toast shown | ☐ |
| 3.1.2 | Violation details | Check violation row | Shows time, student, type badge, application, window title | ☐ |
| 3.1.3 | Page title count | Trigger violations | Browser tab shows "(N) Exam Monitor - Dashboard" | ☐ |
| 3.1.4 | Max violations cap | Trigger 100+ violations | List is capped at 100, oldest removed | ☐ |

### 3.2 Violation History

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 3.2.1 | Open history | Click a student row | History panel opens, scrolls into view, shows loading then data | ☐ |
| 3.2.2 | Empty history | Click a student with no violations | "No recorded violations" message | ☐ |
| 3.2.3 | Close history | Click ✕ button on history panel | Panel hides | ☐ |
| 3.2.4 | Rapid clicks | Click different students quickly | Only the last-clicked student's history is shown (stale guard) | ☐ |
| 3.2.5 | Error handling | Disconnect backend → Click student | Error message shown in panel | ☐ |

---

## 4. Blacklist Management (Week 4)

### 4.1 Load & Display

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 4.1.1 | Initial load | Open dashboard | Blacklist items loaded and displayed | ☐ |
| 4.1.2 | Empty state | No items in backend | "No blacklisted items yet." shown | ☐ |

### 4.2 Add Item

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 4.2.1 | Add application | Type "notepad.exe", select Application → Add | Success feedback, item appears in table | ☐ |
| 4.2.2 | Add website | Type "chatgpt.com", select Website → Add | Success feedback, item appears | ☐ |
| 4.2.3 | Empty name | Leave name blank → Submit | "Please enter a name." error | ☐ |
| 4.2.4 | Long name | Enter 256+ characters → Submit | "Name is too long" error | ☐ |
| 4.2.5 | Duplicate (local) | Add same item twice | "This item is already in the blacklist." error | ☐ |
| 4.2.6 | Duplicate (server) | Add item that exists but wasn't locally loaded | "Item already exists" error (409) | ☐ |
| 4.2.7 | Form clears | Successfully add an item | Input cleared, select reset | ☐ |
| 4.2.8 | Double-submit | Click Add rapidly | Button disabled during request (no duplicate sends) | ☐ |

### 4.3 Delete Item

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 4.3.1 | Delete item | Click ✕ on an item → Confirm | Success feedback, item removed from table | ☐ |
| 4.3.2 | Cancel delete | Click ✕ → Cancel confirm dialog | No change | ☐ |
| 4.3.3 | Delete already-gone | Delete item that was removed by another session | "Item not found" error, list refreshes | ☐ |
| 4.3.4 | Optimistic dim | Click ✕ → Confirm | Row dims to 50% opacity while deleting | ☐ |

### 4.4 Feedback

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 4.4.1 | Success auto-hide | Add an item successfully | Green feedback disappears after ~4 seconds | ☐ |
| 4.4.2 | Error persists | Trigger an error (e.g., duplicate) | Red feedback stays visible until next action | ☐ |

---

## 5. Risk Scores (Week 5)

### 5.1 Display

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 5.1.1 | Initial load | Students connect → Observe student table | Risk badge with score + color shown (green ≤30, yellow 31-60, red >60) | ☐ |
| 5.1.2 | No risk data | Student with no events | Risk badge shows "—" with gray background | ☐ |
| 5.1.3 | Real-time update | Trigger events that change risk score | Risk badge updates without page refresh (via RISK_SCORE_UPDATE WS) | ☐ |
| 5.1.4 | High-risk sorting | Student exceeds score 60 | Student row highlighted, sorts to top of list | ☐ |

### 5.2 Risk Detail Panel

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 5.2.1 | Open detail | Click "📊 Detail" button on a student | Risk detail panel opens, scrolls into view, shows 6 metric cards | ☐ |
| 5.2.2 | Metric values | Check all 6 cards | Score, Level (color-coded), Violations, Window Switches, Suspicious Windows, Last Updated all populated | ☐ |
| 5.2.3 | Recent events | Student has events | Recent events list shown with type badges and timestamps | ☐ |
| 5.2.4 | No events | Student has no recent events | Events section hidden | ☐ |
| 5.2.5 | Close panel | Click ✕ on risk detail panel | Panel hides | ☐ |
| 5.2.6 | No detail button | Student with no risk data (`risk_score === null`) | No "📊 Detail" button shown | ☐ |
| 5.2.7 | Rapid click guard | Click Detail button rapidly | Only one API call made (riskDetailBusy flag) | ☐ |
| 5.2.8 | Error state | Backend returns error for risk detail | Error message shown in panel | ☐ |

---

## 6. Screenshots (Week 5)

### 6.1 Manual Request

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 6.1.1 | Request button | Online student visible | "📷 Request" button shown | ☐ |
| 6.1.2 | Offline student | Student is offline | Button replaced with "—" | ☐ |
| 6.1.3 | Click request | Click "📷 Request" | Button shows "⏳ Requesting...", disabled, toast: "Screenshot requested..." | ☐ |
| 6.1.4 | Screenshot arrives | Desktop sends screenshot | Button re-enables, toast: "Screenshot received...", pending cleared | ☐ |
| 6.1.5 | Timeout (30s) | Request but no response in 30s | Button re-enables automatically | ☐ |
| 6.1.6 | Duplicate request | Click request while one is pending | Warning toast: "A screenshot request is already pending..." | ☐ |
| 6.1.7 | Rate limit | Backend returns 429 | Warning toast about rate limit | ☐ |
| 6.1.8 | Student not connected | Backend returns 400 | Warning toast: "Student is not currently connected." | ☐ |

### 6.2 Screenshot Viewing

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 6.2.1 | Violation screenshot | Violation has `screenshot_id` | "📷 View" button shown in screenshot column | ☐ |
| 6.2.2 | No screenshot | Violation has no `screenshot_id` | "—" shown | ☐ |
| 6.2.3 | Open modal | Click "📷 View" indicator | Modal opens, shows loading, then full image | ☐ |
| 6.2.4 | Close modal (button) | Click ✕ on modal | Modal closes | ☐ |
| 6.2.5 | Close modal (overlay) | Click outside modal content | Modal closes | ☐ |
| 6.2.6 | Close modal (ESC) | Press Escape key | Modal closes | ☐ |
| 6.2.7 | Image load error | Backend returns 404 for screenshot | Error message shown in modal | ☐ |

### 6.3 Caching

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 6.3.1 | Cache hit | Open same screenshot twice | Second open is instant (no network request) | ☐ |
| 6.3.2 | LRU eviction | View 50+ different screenshots | Network tab shows evicted screenshots re-fetched; no memory leak | ☐ |

---

## 7. Enhanced Violations (Week 5)

### 7.1 Filter

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 7.1.1 | Default (All) | Load dashboard with violations | All violation types shown | ☐ |
| 7.1.2 | Filter by type | Select "Blacklisted App" from dropdown | Only BLACKLIST_APP violations shown | ☐ |
| 7.1.3 | Filter empty | Filter to type with no violations | Empty message: "No [type] violations." | ☐ |
| 7.1.4 | Count badge | Apply filter | Badge still shows total count (not filtered count) | ☐ |

### 7.2 Sort

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 7.2.1 | Sort by risk desc | Click "Risk" column header | Violations sorted by risk score descending, arrow indicator shown | ☐ |
| 7.2.2 | Toggle sort | Click Risk header again | Sort flips to ascending | ☐ |
| 7.2.3 | No flash when sorted | New violation arrives while sort active | New row appears in sorted position, no flash animation | ☐ |

### 7.3 Duration Column

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 7.3.1 | Duration shown | Violation with `duration_seconds: 135` | Displays "2m 15s" | ☐ |
| 7.3.2 | Short duration | `duration_seconds: 45` | Displays "45s" | ☐ |
| 7.3.3 | No duration | `duration_seconds: null` | Displays "—" | ☐ |
| 7.3.4 | Zero duration | `duration_seconds: 0` | Displays "—" | ☐ |
| 7.3.5 | History duration | Open student history | Duration column present with same formatting | ☐ |

---

## 8. Behavior Analytics (Week 5)

### 8.1 Suspicious Activity Panel

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 8.1.1 | Empty state | No suspicious alerts | "No suspicious activity detected." message | ☐ |
| 8.1.2 | New alert | SUSPICIOUS_WINDOW WS event arrives | Row appears in analytics table, toast: "⚠ Suspicious window..." | ☐ |
| 8.1.3 | Alert details | Check alert row | Time, student name, window title (truncated), application, risk badge | ☐ |
| 8.1.4 | Alert cap | 50+ suspicious alerts | Capped at 50, oldest removed | ☐ |
| 8.1.5 | Alert count badge | Alerts present | Badge shows count | ☐ |

### 8.2 Summary Bar

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 8.2.1 | Hidden by default | No data present | Summary bar is hidden | ☐ |
| 8.2.2 | Shows on data | Trigger violations/alerts | Summary bar appears with 3 cards | ☐ |
| 8.2.3 | High risk count | Student with score > 60 | "High Risk Students" card shows count | ☐ |
| 8.2.4 | Total violations | Violations present | "Total Violations" card matches violation count | ☐ |
| 8.2.5 | Suspicious windows | Alerts present | "Suspicious Windows" card matches alert count | ☐ |

---

## 9. Toast Notifications

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 9.1 | Toast appears | Trigger violation/screenshot/alert | Toast slides in with icon and message | ☐ |
| 9.2 | Auto-dismiss | Wait 5 seconds after toast | Toast fades out and is removed | ☐ |
| 9.3 | Max toasts | Trigger 6+ rapid toasts | Maximum 5 visible, oldest removed | ☐ |
| 9.4 | Toast types | Trigger success/error/warning/info | Correct icon (✓/✕/⚠/ℹ) and color for each | ☐ |

---

## 10. Cross-Cutting Concerns

| # | Test | Steps | Expected Result | Pass? |
|---|------|-------|-----------------|-------|
| 10.1 | XSS in student name | Create user with name `<script>alert(1)</script>` | Name rendered as text, no script execution | ☐ |
| 10.2 | XSS in window title | Send violation with title `<img onerror=alert(1)>` | Rendered as text in all locations | ☐ |
| 10.3 | XSS in blacklist name | Add item with HTML in name | Rendered as text | ☐ |
| 10.4 | Responsive layout | Resize browser to mobile width | No horizontal overflow, panels stack vertically | ☐ |
| 10.5 | Keyboard nav | Tab to student row → Press Enter | History panel opens | ☐ |

---

## Quick Smoke Test Flow (5 minutes)

1. **Login** → Verify redirect to dashboard, WS indicator green
2. **Student connects** → Verify appears in student list
3. **Add blacklist item** → Verify appears in table, feedback shown
4. **Trigger violation** → Verify live row + toast + page title count
5. **Click student row** → Verify history panel with duration column
6. **Check risk badge** → Verify color coding matches score
7. **Click Detail button** → Verify risk detail panel with 6 cards
8. **Request screenshot** → Verify button loading state
9. **Filter violations** → Verify dropdown works
10. **Sort by Risk** → Verify arrow indicator + reorder
11. **Delete blacklist item** → Verify confirm + removal
12. **Logout** → Verify redirect to login, localStorage cleared

---

**Total test cases: 82**

*Tester: _______________ Date: _______________ Build: Week 5 post-fix*

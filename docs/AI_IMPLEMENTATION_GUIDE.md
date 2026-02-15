# AI_IMPLEMENTATION_GUIDE.md

**FOR AI AGENTS ONLY**

This document provides explicit implementation instructions for AI code generators (GitHub Copilot, ChatGPT, Claude, etc.).

Read this BEFORE generating any code.

---

## ⚠️ CRITICAL RULES (NEVER VIOLATE)

### ARCHITECTURE RULES
```
MUST:
✅ Backend is always the source of truth
✅ All endpoints use JWT (except /auth/login and /auth/register)
✅ WebSocket requires JWT in query param: ws://host/ws?token=JWT
✅ All JSON must match API_CONTRACT.md EXACTLY
✅ Desktop and Frontend NEVER communicate directly
✅ All monitoring events stored in database
✅ Screenshots only triggered (NEVER continuous)
✅ Screenshot capture on separate thread (async/non-blocking)

NEVER:
❌ Never store passwords in plain text (ALWAYS hash with bcrypt)
❌ Never hardcode secrets (use .env)
❌ Never block UI thread with screenshots
❌ Never send screenshot > 1 MB
❌ Never allow students to access screenshots
❌ Never capture screenshots continuously
❌ Never skip JWT validation
❌ Never expose raw error details to clients
```

---

## 📊 DATA STRUCTURES (COPY EXACTLY)

### Database Schema (SQL)

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MonitoringEvents Table
CREATE TABLE monitoring_events (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('HEARTBEAT', 'BLACKLIST_APP', 'WINDOW_FOCUS', 'SUSPICIOUS_BEHAVIOR')),
    application_name VARCHAR(255),
    window_title VARCHAR(500),
    duration_seconds INTEGER,
    timestamp TIMESTAMP NOT NULL,
    screenshot_id INTEGER REFERENCES screenshots(id),
    INDEX idx_student_timestamp (student_id, timestamp)
);

-- Blacklist Table
CREATE TABLE blacklist (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('APPLICATION', 'WEBSITE')),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, type)
);

-- Screenshots Table
CREATE TABLE screenshots (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES monitoring_events(id),
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('VIOLATION', 'MANUAL_REQUEST', 'RANDOM_CHECK', 'HIGH_RISK_BEHAVIOR')),
    file_path VARCHAR(500) NOT NULL,
    captured_at TIMESTAMP NOT NULL,
    viewed_by INTEGER REFERENCES users(id),
    viewed_at TIMESTAMP,
    INDEX idx_student_captured (student_id, captured_at)
);

-- StudentRiskScores Table
CREATE TABLE student_risk_scores (
    id SERIAL PRIMARY KEY,
    student_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    violation_count INTEGER DEFAULT 0,
    window_switch_count INTEGER DEFAULT 0,
    suspicious_window_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inspection Sessions
CREATE TABLE inspection_sessions (
    id SERIAL PRIMARY KEY,
    instructor_id INTEGER NOT NULL REFERENCES users(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    student_notified BOOLEAN DEFAULT TRUE,
    screenshots_captured INTEGER DEFAULT 0,
    INDEX idx_instructor (instructor_id),
    INDEX idx_student (student_id)
);

-- Control Sessions
CREATE TABLE control_sessions (
    id SERIAL PRIMARY KEY,
    instructor_id INTEGER NOT NULL REFERENCES users(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    reason VARCHAR(500) NOT NULL,
    admin_password_hash VARCHAR(255) NOT NULL,
    authorized_by INTEGER REFERENCES users(id),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    INDEX idx_instructor (instructor_id),
    INDEX idx_student (student_id)
);

-- Control Actions Log (Audit Trail)
CREATE TABLE control_actions (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES control_sessions(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- MOUSE_MOVE, MOUSE_CLICK, KEY_PRESS
    action_data JSONB NOT NULL, -- {x: 450, y: 300} or {key: "Enter"}
    timestamp TIMESTAMP NOT NULL,
    INDEX idx_session (session_id),
    INDEX idx_timestamp (timestamp)
);
```

---

## 🔐 JWT IMPLEMENTATION (EXACT CODE)

### Backend (Python/FastAPI)

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# MUST load from .env
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """ALWAYS use this to hash passwords"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """ALWAYS use this to verify passwords"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """
    MUST include: username, role
    MUST set expiration
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """
    Returns: {"username": str, "role": str}
    Raises: JWTError if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("Invalid token")
```

### Desktop (C#)

```csharp
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

public class ApiClient
{
    private readonly HttpClient _httpClient;
    private string _jwtToken;

    public ApiClient(string baseUrl)
    {
        _httpClient = new HttpClient { BaseAddress = new Uri(baseUrl) };
    }

    public async Task<bool> LoginAsync(string username, string password)
    {
        var loginData = new { username, password };
        var json = JsonConvert.SerializeObject(loginData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync("/auth/login", content);
        
        if (!response.IsSuccessStatusCode)
            return false;

        var responseBody = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<LoginResponse>(responseBody);
        
        _jwtToken = result.access_token;
        
        // MUST store token for all future requests
        _httpClient.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _jwtToken);
        
        return true;
    }

    public string GetJwtToken() => _jwtToken;
}

public class LoginResponse
{
    public string access_token { get; set; }
    public string token_type { get; set; }
    public string role { get; set; }
}
```

---

## 📸 SCREENSHOT IMPLEMENTATION (EXACT CODE)

### Desktop (C#) - Screenshot Capture Module

```csharp
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Threading.Tasks;

public class ScreenshotCapture
{
    private const int MAX_SIZE_KB = 500;
    private const long JPEG_QUALITY = 60L;

    /// <summary>
    /// MUST run on separate thread - NEVER block UI
    /// MUST compress to < 500 KB
    /// MUST return base64 string
    /// </summary>
    public static async Task<string> CaptureScreenAsync()
    {
        return await Task.Run(() =>
        {
            try
            {
                // Step 1: Capture screen
                var bounds = Screen.PrimaryScreen.Bounds;
                using (var bitmap = new Bitmap(bounds.Width, bounds.Height))
                {
                    using (var graphics = Graphics.FromImage(bitmap))
                    {
                        graphics.CopyFromScreen(Point.Empty, Point.Empty, bounds.Size);
                    }

                    // Step 2: Compress to JPEG
                    using (var ms = new MemoryStream())
                    {
                        var encoder = GetEncoder(ImageFormat.Jpeg);
                        var encoderParams = new EncoderParameters(1);
                        encoderParams.Param[0] = new EncoderParameter(
                            System.Drawing.Imaging.Encoder.Quality, JPEG_QUALITY);

                        bitmap.Save(ms, encoder, encoderParams);

                        // Step 3: Check size and reduce if needed
                        byte[] imageBytes = ms.ToArray();
                        
                        if (imageBytes.Length > MAX_SIZE_KB * 1024)
                        {
                            imageBytes = CompressFurther(bitmap);
                        }

                        // Step 4: Convert to base64
                        return Convert.ToBase64String(imageBytes);
                    }
                }
            }
            catch (Exception ex)
            {
                // NEVER crash - log and return null
                Console.WriteLine($"Screenshot failed: {ex.Message}");
                return null;
            }
        });
    }

    private static ImageCodecInfo GetEncoder(ImageFormat format)
    {
        var codecs = ImageCodecInfo.GetImageDecoders();
        foreach (var codec in codecs)
        {
            if (codec.FormatID == format.Guid)
                return codec;
        }
        return null;
    }

    private static byte[] CompressFurther(Bitmap bitmap)
    {
        // Reduce resolution if too large
        int newWidth = bitmap.Width / 2;
        int newHeight = bitmap.Height / 2;
        
        using (var resized = new Bitmap(newWidth, newHeight))
        using (var graphics = Graphics.FromImage(resized))
        {
            graphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
            graphics.DrawImage(bitmap, 0, 0, newWidth, newHeight);
            
            using (var ms = new MemoryStream())
            {
                resized.Save(ms, ImageFormat.Jpeg);
                return ms.ToArray();
            }
        }
    }
}
```

### Backend (Python) - Screenshot Storage

```python
import base64
import os
from datetime import datetime
from pathlib import Path

SCREENSHOT_DIR = Path("screenshots")
MAX_SIZE_MB = 1

def save_screenshot(student_id: int, base64_data: str, trigger_type: str) -> dict:
    """
    MUST validate size before saving
    MUST create directory structure
    MUST return metadata
    """
    try:
        # Step 1: Validate base64 and decode
        image_bytes = base64.b64decode(base64_data)
        
        # Step 2: Validate size
        size_mb = len(image_bytes) / (1024 * 1024)
        if size_mb > MAX_SIZE_MB:
            raise ValueError(f"Screenshot too large: {size_mb:.2f} MB")
        
        # Step 3: Create directory structure
        date_str = datetime.now().strftime("%Y-%m-%d")
        student_dir = SCREENSHOT_DIR / str(student_id) / date_str
        student_dir.mkdir(parents=True, exist_ok=True)
        
        # Step 4: Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{timestamp}.jpg"
        filepath = student_dir / filename
        
        # Step 5: Save file
        with open(filepath, "wb") as f:
            f.write(image_bytes)
        
        # Step 6: Return metadata
        return {
            "file_path": str(filepath),
            "size_kb": len(image_bytes) / 1024,
            "captured_at": datetime.now()
        }
        
    except Exception as e:
        print(f"Screenshot save failed: {e}")
        raise
```

---

## 🎯 RISK SCORE CALCULATION (EXACT ALGORITHM)

### Backend (Python)

```python
from datetime import datetime, timedelta

class RiskScoreCalculator:
    """
    MUST follow these exact scoring rules
    MUST apply decay over time
    MUST cap at 100
    """
    
    # Scoring rules (DO NOT MODIFY)
    SCORES = {
        "BLACKLIST_APP": 20,
        "SUSPICIOUS_WINDOW": 10,
        "RAPID_WINDOW_SWITCH": 5,
        "LONG_IDLE": 15,
        "EXAM_WINDOW_LOST_FOCUS": 25
    }
    
    DECAY_RATE = 1  # points per 2 minutes
    DECAY_INTERVAL_MINUTES = 2
    
    @staticmethod
    def calculate_risk_score(
        current_score: int,
        event_type: str,
        last_updated: datetime
    ) -> int:
        """
        Step 1: Apply time decay
        Step 2: Add event score
        Step 3: Cap at 100
        Step 4: Floor at 0
        """
        # Step 1: Time decay
        time_diff = datetime.now() - last_updated
        decay_periods = int(time_diff.total_seconds() / (RiskScoreCalculator.DECAY_INTERVAL_MINUTES * 60))
        decayed_score = max(0, current_score - (decay_periods * RiskScoreCalculator.DECAY_RATE))
        
        # Step 2: Add event score
        event_score = RiskScoreCalculator.SCORES.get(event_type, 0)
        new_score = decayed_score + event_score
        
        # Step 3: Cap at 100
        final_score = min(100, new_score)
        
        return final_score
    
    @staticmethod
    def get_risk_level(score: int) -> str:
        """
        MUST use these exact thresholds
        """
        if score <= 30:
            return "LOW"
        elif score <= 60:
            return "MEDIUM"
        else:
            return "HIGH"
```

---

## 🔄 WEBSOCKET IMPLEMENTATION (EXACT PATTERNS)

### Backend (Python/FastAPI)

```python
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        # student_id -> WebSocket
        self.student_connections: Dict[int, WebSocket] = {}
        # instructor connections (list)
        self.instructor_connections: List[WebSocket] = []
    
    async def connect_student(self, student_id: int, websocket: WebSocket):
        """MUST validate JWT before calling this"""
        await websocket.accept()
        self.student_connections[student_id] = websocket
        await self.broadcast_to_instructors({
            "type": "STUDENT_STATUS",
            "data": {"student_id": student_id, "status": "ONLINE"}
        })
    
    async def connect_instructor(self, websocket: WebSocket):
        """MUST validate JWT before calling this"""
        await websocket.accept()
        self.instructor_connections.append(websocket)
    
    def disconnect_student(self, student_id: int):
        """MUST call on disconnect"""
        if student_id in self.student_connections:
            del self.student_connections[student_id]
    
    async def broadcast_to_instructors(self, message: dict):
        """MUST use for all instructor notifications"""
        dead_connections = []
        for connection in self.instructor_connections:
            try:
                await connection.send_json(message)
            except:
                dead_connections.append(connection)
        
        # Clean up dead connections
        for conn in dead_connections:
            self.instructor_connections.remove(conn)
    
    async def send_to_student(self, student_id: int, message: dict):
        """Use for screenshot requests"""
        if student_id in self.student_connections:
            await self.student_connections[student_id].send_json(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """
    MUST validate token first
    MUST determine role
    MUST route messages correctly
    """
    try:
        # Step 1: Validate token
        payload = decode_token(token)
        user_id = payload["user_id"]
        role = payload["role"]
        
        # Step 2: Connect based on role
        if role == "student":
            await manager.connect_student(user_id, websocket)
            try:
                while True:
                    data = await websocket.receive_json()
                    await handle_student_message(user_id, data)
            except WebSocketDisconnect:
                manager.disconnect_student(user_id)
        
        elif role == "instructor":
            await manager.connect_instructor(websocket)
            try:
                while True:
                    data = await websocket.receive_json()
                    await handle_instructor_message(data)
            except WebSocketDisconnect:
                manager.instructor_connections.remove(websocket)
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()
```

### Desktop (C#)

```csharp
using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class WebSocketClient
{
    private ClientWebSocket _ws;
    private string _jwtToken;
    private int _studentId;
    private CancellationTokenSource _cts;

    public async Task ConnectAsync(string wsUrl, string jwtToken, int studentId)
    {
        _jwtToken = jwtToken;
        _studentId = studentId;
        _ws = new ClientWebSocket();
        _cts = new CancellationTokenSource();

        // MUST include token in URL
        var uri = new Uri($"{wsUrl}?token={jwtToken}");
        await _ws.ConnectAsync(uri, _cts.Token);

        // Start listening
        _ = Task.Run(async () => await ReceiveLoop());
        
        // Start heartbeat
        _ = Task.Run(async () => await HeartbeatLoop());
    }

    private async Task HeartbeatLoop()
    {
        while (_ws.State == WebSocketState.Open)
        {
            var heartbeat = new
            {
                event_type = "HEARTBEAT",
                student_id = _studentId,
                timestamp = DateTime.UtcNow.ToString("o")
            };
            
            await SendAsync(heartbeat);
            await Task.Delay(5000); // Every 5 seconds
        }
    }

    public async Task SendAsync(object message)
    {
        var json = JsonConvert.SerializeObject(message);
        var bytes = Encoding.UTF8.GetBytes(json);
        var buffer = new ArraySegment<byte>(bytes);
        
        await _ws.SendAsync(buffer, WebSocketMessageType.Text, true, _cts.Token);
    }

    private async Task ReceiveLoop()
    {
        var buffer = new byte[1024 * 1024]; // 1 MB buffer for screenshots
        
        while (_ws.State == WebSocketState.Open)
        {
            try
            {
                var result = await _ws.ReceiveAsync(
                    new ArraySegment<byte>(buffer), _cts.Token);
                
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    var data = JsonConvert.DeserializeObject<dynamic>(message);
                    
                    await HandleMessage(data);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Receive error: {ex.Message}");
                break;
            }
        }
        
        // Auto-reconnect
        await Task.Delay(5000);
        await ConnectAsync(_ws.Options.RequestUri.ToString(), _jwtToken, _studentId);
    }

    private async Task HandleMessage(dynamic message)
    {
        string messageType = message.type;
        
        if (messageType == "SCREENSHOT_REQUEST")
        {
            // MUST respond with screenshot
            string requestId = message.request_id;
            await HandleScreenshotRequest(requestId);
        }
        else if (messageType == "BLACKLIST_UPDATED")
        {
            // MUST refresh blacklist
            await RefreshBlacklist();
        }
    }
}
```

---

## ✅ VALIDATION CHECKLISTS

### Before Committing Code:

**Backend Checklist:**
```
□ All passwords hashed with bcrypt
□ All endpoints have JWT validation (except login/register)
□ All database queries use parameterized queries (no SQL injection)
□ All error responses use structured JSON format
□ All WebSocket messages validated
□ Screenshot size validated (< 1 MB)
□ Risk score capped at 0-100
□ All database operations in try-catch
□ .env file used for secrets
□ CORS configured properly
```

**Desktop Checklist:**
```
□ Screenshot capture on separate thread
□ Screenshot compressed to < 500 KB
□ JWT included in all requests
□ WebSocket auto-reconnects on disconnect
□ No UI freezing during monitoring
□ All errors logged locally
□ Monitoring loop never crashes
□ Window title captured correctly
□ Process detection works
```

**Frontend Checklist:**
```
□ JWT stored securely
□ Token expiration handled (redirect to login)
□ WebSocket reconnects automatically
□ Screenshots lazy-loaded
□ Risk scores color-coded correctly
□ All API errors displayed to user
□ Loading states shown
□ No XSS vulnerabilities
```

---

## 🚨 COMMON MISTAKES (AVOID THESE)

### ❌ Mistake 1: Blocking UI with Screenshot
```csharp
// WRONG - blocks UI thread
public void CaptureScreenshot()
{
    var screenshot = new Bitmap(...);
    // UI frozen here
}

// CORRECT - async on background thread
public async Task<string> CaptureScreenshotAsync()
{
    return await Task.Run(() => {
        // runs on background thread
    });
}
```

### ❌ Mistake 2: Not Validating Screenshot Size
```python
# WRONG - no validation
def save_screenshot(base64_data):
    image_bytes = base64.b64decode(base64_data)
    # could be 10 MB!

# CORRECT - validate first
def save_screenshot(base64_data):
    image_bytes = base64.b64decode(base64_data)
    if len(image_bytes) > 1024 * 1024:  # 1 MB
        raise ValueError("Screenshot too large")
```

### ❌ Mistake 3: Storing Passwords in Plain Text
```python
# WRONG
user.password = request.password

# CORRECT
user.hashed_password = hash_password(request.password)
```

### ❌ Mistake 4: Not Handling WebSocket Disconnects
```csharp
// WRONG - no reconnect logic
await _ws.ConnectAsync(uri);

// CORRECT - auto-reconnect
try {
    await _ws.ConnectAsync(uri);
} catch {
    await Task.Delay(5000);
    await ConnectAsync(); // retry
}
```

---

## 📋 DECISION TREES

### Screenshot Trigger Decision Tree
```
Event Detected
    ├─ Is it a blacklist violation?
    │   ├─ YES → Capture screenshot immediately
    │   └─ NO → Continue to next check
    │
    ├─ Is risk score > 60?
    │   ├─ YES → Capture screenshot (spot check)
    │   └─ NO → Continue to next check
    │
    ├─ Is it a manual request?
    │   ├─ YES → Capture screenshot immediately
    │   └─ NO → Continue to next check
    │
    └─ Is it time for random check? (every 10 min)
        ├─ YES → Capture screenshot
        └─ NO → Don't capture
```

### Risk Score Update Decision Tree
```
Event Received
    ├─ Calculate time since last update
    │   └─ Apply decay: -1 per 2 minutes
    │
    ├─ What event type?
    │   ├─ BLACKLIST_APP → Add 20 points
    │   ├─ SUSPICIOUS_WINDOW → Add 10 points
    │   ├─ RAPID_WINDOW_SWITCH → Add 5 points
    │   └─ LONG_IDLE → Add 15 points
    │
    ├─ Cap score at 100
    │
    ├─ Has risk level changed?
    │   ├─ YES → Broadcast update to instructors
    │   └─ NO → Just update database
    │
    └─ Is new score > 60?
        ├─ YES → Trigger screenshot
        └─ NO → Continue
```

---

## 🎯 IMPLEMENTATION ORDER (FOLLOW STRICTLY)

### Week 1-4: Core System
1. Backend authentication (Day 1-2)
2. Desktop login (Day 1-2)
3. Frontend login (Day 1-2)
4. WebSocket connection (Week 2)
5. Process monitoring (Week 3)
6. Blacklist system (Week 4)

### Week 5: Smart Monitoring
**MUST implement in this order:**
1. Database schema updates (Day 1)
2. Window title tracking (Day 1-2)
3. Screenshot capture module (Day 2-3)
4. Screenshot storage backend (Day 3)
5. Risk score calculation (Day 3-4)
6. Screenshot viewing frontend (Day 4-5)
7. Manual screenshot request (Day 5)

### Week 6: Integration
1. End-to-end testing
2. Bug fixes
3. Performance optimization
4. Demo preparation

---

## 📝 CODE GENERATION TEMPLATES

### When generating backend endpoint:
```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List

router = APIRouter()

@router.get("/endpoint-name", response_model=ResponseModel)
async def endpoint_name(
    # ALWAYS include JWT dependency
    current_user: dict = Depends(get_current_user)
):
    """
    Description of what this endpoint does
    
    Requirements:
    - Must validate ...
    - Must check ...
    
    Returns:
    - ...
    """
    try:
        # STEP 1: Validate input
        
        # STEP 2: Check permissions
        if current_user["role"] != "instructor":
            raise HTTPException(status_code=403, detail="Forbidden")
        
        # STEP 3: Database operation
        
        # STEP 4: Return response
        
    except Exception as e:
        # ALWAYS log errors
        print(f"Error in endpoint_name: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### When generating desktop monitoring code:
```csharp
public class MonitoringService
{
    private Timer _monitoringTimer;
    private WebSocketClient _wsClient;
    private List<string> _blacklist;
    
    public void StartMonitoring()
    {
        // MUST run on separate thread
        _monitoringTimer = new Timer(MonitoringLoop, null, 0, 5000);
    }
    
    private async void MonitoringLoop(object state)
    {
        try
        {
            // STEP 1: Get running processes
            var processes = Process.GetProcesses();
            
            // STEP 2: Check against blacklist
            foreach (var process in processes)
            {
                if (_blacklist.Contains(process.ProcessName.ToLower()))
                {
                    // STEP 3: Violation detected
                    await HandleViolation(process.ProcessName);
                }
            }
            
            // STEP 4: Get active window
            var windowTitle = GetActiveWindowTitle();
            
            // STEP 5: Check for suspicious keywords
            if (ContainsSuspiciousKeywords(windowTitle))
            {
                await HandleSuspiciousWindow(windowTitle);
            }
        }
        catch (Exception ex)
        {
            // NEVER crash monitoring loop
            Console.WriteLine($"Monitoring error: {ex.Message}");
        }
    }
}
```

---

## 🔍 TESTING REQUIREMENTS

### MUST test these scenarios:

**Authentication:**
- [ ] Valid login returns JWT
- [ ] Invalid login returns 401
- [ ] Expired JWT rejected
- [ ] Wrong role blocked from endpoints

**Monitoring:**
- [ ] Process detection works
- [ ] Blacklist violation triggers event
- [ ] Heartbeat sent every 5 seconds
- [ ] WebSocket reconnects on disconnect

**Screenshots:**
- [ ] Screenshot captured on violation
- [ ] Screenshot < 500 KB
- [ ] Screenshot linked to event
- [ ] Manual request works
- [ ] UI doesn't freeze during capture

**Risk Scores:**
- [ ] Score increases on violation
- [ ] Score decreases over time (decay)
- [ ] Score capped at 100
- [ ] Risk level calculated correctly

---

## 📞 FOR AI AGENTS: WHEN UNCERTAIN

If you encounter ambiguity:
1. Refer to API_CONTRACT.md for JSON structures
2. Refer to ARCHITECTURE.md for system design
3. Refer to USE_CASES.md for behavioral flows
4. Follow this guide for implementation details
5. NEVER guess - ask for clarification

If conflicting instructions:
1. Security rules take priority
2. API_CONTRACT.md takes priority over examples
3. ARCHITECTURE.md takes priority over convenience
4. Explicit MUST/NEVER rules cannot be overridden

---

**END OF AI IMPLEMENTATION GUIDE**

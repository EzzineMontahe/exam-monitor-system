# PHASE_0.md
Project: Exam Monitoring System

## PURPOSE

This file defines the **mandatory environment initialization process**.

It must be provided to the AI agent **BEFORE** starting Week 1 or any development week.

This file ensures:
- ✅ All tools are installed
- ✅ All dependencies are ready
- ✅ No environment-related blockers occur
- ✅ Setup matches the current week's technical requirements

---

## 🌍 GLOBAL ENVIRONMENT REQUIREMENTS (ALL ROLES)

### 1️⃣ Install Git

**Command to verify:**
```bash
git --version
```

**Expected output:**
```
git version 2.40+ (any recent version)
```

**If not installed:**
- Windows: Download from https://git-scm.com/download/win
- Mac: `brew install git` or download from https://git-scm.com
- Linux: `sudo apt-get install git` (Ubuntu/Debian)

---

### 2️⃣ Clone Repository

**Commands:**
```bash
git clone https://github.com/ghassendebbich/exam-monitor-system.git
cd exam-monitor-system
```

**Verify:**
```bash
ls
# Should see: backend/, desktop/, frontend/, docs/, etc.
```

---

### 3️⃣ Install Visual Studio Code

**Download:** https://code.visualstudio.com

**Recommended Extensions:**
```
✅ Python (Microsoft)
✅ C# Dev Kit (Microsoft) 
✅ JavaScript (ES6) code snippets
✅ GitLens
✅ Thunder Client (for API testing)
✅ Live Server (for frontend)
```

**To install extensions:**
```bash
code --install-extension ms-python.python
code --install-extension ms-dotnettools.csdevkit
code --install-extension rangav.vscode-thunder-client
```

---

### 4️⃣ Git Workflow Setup

**CRITICAL RULE:** Never commit directly to `main`

**Create personal branch:**
```bash
# For Backend Developer
git checkout -b backend-dev
git push -u origin backend-dev

# For Desktop Developer
git checkout -b desktop-dev
git push -u origin desktop-dev

# For Frontend Developer
git checkout -b frontend-dev
git push -u origin frontend-dev
```

**Verify current branch:**
```bash
git branch
# Should show: * backend-dev (or desktop-dev or frontend-dev)
```

---

## 💻 BACKEND DEVELOPER INITIALIZATION

### Required Software

| Software | Minimum Version | Verify Command |
|----------|----------------|----------------|
| Python | 3.11+ | `python --version` |
| pip | 23.0+ | `pip --version` |
| Git | 2.30+ | `git --version` |

---

### Step-by-Step Setup

#### **Step 1: Verify Python Installation**

```bash
python --version
# Expected: Python 3.11.x or higher

pip --version
# Expected: pip 23.x.x or higher
```

**If Python not installed or version too old:**
- Download Python 3.11+ from https://www.python.org/downloads/
- ✅ Check "Add Python to PATH" during installation
- Restart terminal after installation

---

#### **Step 2: Navigate to Backend Folder**

```bash
cd backend
ls
# Should see (or will create): app/, venv/, requirements.txt
```

---

#### **Step 3: Create Virtual Environment**

```bash
# Windows
python -m venv venv

# Mac/Linux
python3 -m venv venv
```

**Verify creation:**
```bash
ls venv/
# Should see: bin/ (or Scripts/), lib/, include/
```

---

#### **Step 4: Activate Virtual Environment**

```bash
# Windows (CMD)
venv\Scripts\activate

# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Mac/Linux
source venv/bin/activate
```

**Verify activation:**
```bash
which python
# Should show path inside venv/
# Example: /path/to/backend/venv/bin/python
```

---

#### **Step 5: Install Dependencies**

**For Week 1-2 (Core + Authentication + WebSocket):**
```bash
pip install fastapi==0.104.1
pip install uvicorn[standard]==0.24.0
pip install sqlalchemy==2.0.23
pip install passlib[bcrypt]==1.7.4
pip install python-jose[cryptography]==3.3.0
pip install python-dotenv==1.0.0
pip install pydantic==2.5.0
pip install websockets==12.0
```

**For Week 3+ (Additional monitoring features):**
```bash
pip install psycopg2-binary==2.9.9  # If using PostgreSQL
pip install pillow==10.1.0  # For screenshot handling (Week 5)
```

**Generate requirements.txt:**
```bash
pip freeze > requirements.txt
```

---

#### **Step 6: Create Project Structure**

```bash
mkdir -p app/models app/routes app/core app/services
touch app/__init__.py
touch app/main.py
touch app/models/__init__.py
touch app/routes/__init__.py
touch app/core/__init__.py
touch app/services/__init__.py
touch .env
```

**Verify structure:**
```bash
tree app/
# Should show folder structure with __init__.py files
```

---

#### **Step 7: Create Basic FastAPI App (If Not Existing)**

**File: `app/main.py`**
```python
from fastapi import FastAPI

app = FastAPI(title="Exam Monitoring System")

@app.get("/")
def read_root():
    return {"message": "Exam Monitoring System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

**File: `.env`**
```
SECRET_KEY=your-secret-key-here-change-this-in-production
DATABASE_URL=sqlite:///./exam_monitor.db
```

---

#### **Step 8: Test Server**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

**Open browser and test:**
```
http://127.0.0.1:8000/
http://127.0.0.1:8000/docs  # Swagger UI
http://127.0.0.1:8000/health
```

---

### Backend Validation Checklist

```
✅ Python 3.11+ installed
✅ pip working
✅ Virtual environment created and activated
✅ All dependencies installed (pip freeze shows packages)
✅ requirements.txt generated
✅ Project structure created
✅ FastAPI server runs without errors
✅ Swagger UI accessible at /docs
✅ /health endpoint returns {"status": "healthy"}
✅ Git branch set to backend-dev
✅ .env file created (with SECRET_KEY)
```

---

### Week-Specific Backend Requirements

**Week 1 (Authentication):**
- ✅ fastapi, passlib, python-jose installed
- ✅ SQLAlchemy models can be created
- ✅ JWT token generation tested

**Week 2 (WebSocket):**
- ✅ websockets package installed
- ✅ Async/await syntax verified
- ✅ WebSocket endpoint can be created

**Week 3 (Monitoring Events):**
- ✅ Database connected
- ✅ CRUD operations working
- ✅ Foreign keys enforced

**Week 5 (Screenshots):**
- ✅ Pillow installed (for image validation)
- ✅ File system write permissions verified
- ✅ /screenshots/ directory created

---

### Common Backend Issues & Solutions

**Issue: "python: command not found"**
```bash
# Try python3 instead
python3 --version
# Or add Python to PATH
```

**Issue: "pip: command not found"**
```bash
python -m pip --version
# Use: python -m pip install <package>
```

**Issue: Virtual environment not activating**
```bash
# Windows PowerShell: May need to enable scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Issue: "ModuleNotFoundError: No module named 'fastapi'"**
```bash
# Ensure venv is activated (should see (venv) in prompt)
# Then reinstall
pip install fastapi
```

---

## 🖥️ DESKTOP DEVELOPER INITIALIZATION

### Required Software

| Software | Minimum Version | Verify Command |
|----------|----------------|----------------|
| .NET SDK | 8.0+ | `dotnet --version` |
| Visual Studio | 2022 | Check "About" in VS |
| Git | 2.30+ | `git --version` |

---

### Step-by-Step Setup

#### **Step 1: Install Visual Studio 2022**

**Download:** https://visualstudio.microsoft.com/downloads/

**Required Workloads:**
- ✅ .NET desktop development
- ✅ Desktop development with C++

---

#### **Step 2: Verify .NET SDK**

```bash
dotnet --version
# Expected: 8.0.x or higher
```

**If not installed:**
- Download from https://dotnet.microsoft.com/download/dotnet/8.0
- Install SDK (not just runtime)

---

#### **Step 3: Create Windows Forms Project**

**Option A: Using Visual Studio (Recommended)**
1. Open Visual Studio 2022
2. Click "Create a new project"
3. Search: "Windows Forms App"
4. Select: "Windows Forms App (.NET)" [NOT .NET Framework]
5. Project name: `ExamMonitorDesktop`
6. Location: `exam-monitor-system/desktop/`
7. Framework: `.NET 8.0`
8. Click "Create"

**Option B: Using Command Line**
```bash
cd desktop
dotnet new winforms -n ExamMonitorDesktop -f net8.0
cd ExamMonitorDesktop
dotnet build
```

---

#### **Step 4: Install NuGet Packages**

**Open Package Manager Console in Visual Studio:**
```
Tools → NuGet Package Manager → Package Manager Console
```

**Install required packages:**
```powershell
Install-Package Newtonsoft.Json -Version 13.0.3
Install-Package System.Net.Http -Version 4.3.4
```

**Or using .NET CLI:**
```bash
dotnet add package Newtonsoft.Json --version 13.0.3
dotnet add package System.Net.Http --version 4.3.4
```

---

#### **Step 5: Create Folder Structure**

**In Visual Studio Solution Explorer, create folders:**
```
ExamMonitorDesktop/
├── Core/          (authentication, config)
├── Services/      (API client, WebSocket client)
├── Models/        (data models)
├── Utils/         (helpers, extensions)
├── Forms/         (UI forms)
└── Resources/     (images, icons)
```

**Or via command line:**
```bash
cd desktop/ExamMonitorDesktop
mkdir Core Services Models Utils Forms Resources
```

---

#### **Step 6: Build Solution**

**In Visual Studio:**
```
Build → Build Solution (Ctrl+Shift+B)
```

**Or via CLI:**
```bash
dotnet build
```

**Expected output:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

---

#### **Step 7: Test HTTP Request (Validation)**

**Create file: `Services/ApiClient.cs`**
```csharp
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace ExamMonitorDesktop.Services
{
    public class ApiClient
    {
        private readonly HttpClient _httpClient;

        public ApiClient(string baseUrl)
        {
            _httpClient = new HttpClient { BaseAddress = new Uri(baseUrl) };
        }

        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/health");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}
```

---

### Desktop Validation Checklist

```
✅ Visual Studio 2022 installed
✅ .NET 8.0 SDK installed and verified
✅ Windows Forms project created
✅ Project builds without errors (0 warnings, 0 errors)
✅ Newtonsoft.Json package installed
✅ System.Net.Http available
✅ Folder structure created
✅ ApiClient.cs compiles
✅ Git branch set to desktop-dev
✅ Can run application (even if just empty form)
```

---

### Week-Specific Desktop Requirements

**Week 1 (Login):**
- ✅ LoginForm created
- ✅ HttpClient can send POST request
- ✅ JSON serialization/deserialization works

**Week 2 (WebSocket):**
- ✅ System.Net.WebSockets.Client tested
- ✅ Async/await patterns verified
- ✅ Timer for heartbeat tested

**Week 3 (Process Monitoring):**
- ✅ System.Diagnostics.Process namespace accessible
- ✅ Can enumerate running processes
- ✅ Application runs with necessary permissions

**Week 5 (Screenshots):**
- ✅ System.Drawing.Bitmap available
- ✅ Graphics.CopyFromScreen tested
- ✅ Image compression to JPEG works
- ✅ Base64 encoding functional

---

### Common Desktop Issues & Solutions

**Issue: ".NET SDK not found"**
```bash
# Verify installation
dotnet --list-sdks
# Should show: 8.0.xxx [path]

# If missing, download SDK from microsoft.com
```

**Issue: "Build failed - package not restored"**
```bash
# Restore NuGet packages
dotnet restore
```

**Issue: "Unable to enumerate processes"**
```
# Run Visual Studio as Administrator
# Right-click VS → Run as Administrator
```

**Issue: "System.Drawing not found"**
```bash
# Add reference manually
dotnet add package System.Drawing.Common --version 8.0.0
```

---

## 🌐 FRONTEND DEVELOPER INITIALIZATION

### Required Software

| Software | Minimum Version | Verify Command |
|----------|----------------|----------------|
| Node.js | 18.x LTS+ | `node --version` |
| npm | 9.0+ | `npm --version` |
| Git | 2.30+ | `git --version` |

---

### Step-by-Step Setup

#### **Step 1: Install Node.js**

**Download:** https://nodejs.org/ (LTS version)

**Verify installation:**
```bash
node --version
# Expected: v18.x.x or v20.x.x

npm --version
# Expected: 9.x.x or 10.x.x
```

---

#### **Step 2: Navigate to Frontend Folder**

```bash
cd frontend
```

---

#### **Step 3: Initialize Project**

```bash
npm init -y
```

**This creates `package.json`**

---

#### **Step 4: Install Dependencies**

```bash
# Development server
npm install --save-dev live-server

# Optional: For production bundling (Week 6)
npm install --save-dev webpack webpack-cli
```

---

#### **Step 5: Create Project Structure**

```bash
mkdir -p public/js public/css public/assets
touch public/index.html
touch public/login.html
touch public/dashboard.html
touch public/js/auth.js
touch public/js/api.js
touch public/js/dashboard.js
touch public/css/styles.css
```

**Verify structure:**
```bash
tree public/
```

Expected:
```
public/
├── index.html
├── login.html
├── dashboard.html
├── js/
│   ├── auth.js
│   ├── api.js
│   └── dashboard.js
├── css/
│   └── styles.css
└── assets/
```

---

#### **Step 6: Update package.json Scripts**

**Edit `package.json`:**
```json
{
  "name": "exam-monitor-frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "live-server public",
    "dev": "live-server public --port=3000"
  },
  "devDependencies": {
    "live-server": "^1.2.2"
  }
}
```

---

#### **Step 7: Create Basic HTML**

**File: `public/index.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exam Monitor - Home</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <h1>Exam Monitoring System</h1>
    <p>Frontend is working!</p>
    <a href="login.html">Go to Login</a>
    
    <script src="js/api.js"></script>
</body>
</html>
```

**File: `public/js/api.js`**
```javascript
const API_BASE_URL = 'http://localhost:8000';

async function testBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('Backend connected:', data);
        return true;
    } catch (error) {
        console.error('Backend connection failed:', error);
        return false;
    }
}

// Test on load
testBackendConnection();
```

---

#### **Step 8: Run Development Server**

```bash
npm start
```

**Expected output:**
```
Serving "public" at http://127.0.0.1:8080
Ready for changes
```

**Browser should auto-open to:** http://127.0.0.1:8080

---

### Frontend Validation Checklist

```
✅ Node.js 18+ installed
✅ npm working
✅ package.json created
✅ live-server installed
✅ Project structure created (public/js, public/css)
✅ index.html created and loads
✅ npm start runs without errors
✅ Browser opens automatically
✅ Console shows no JavaScript errors
✅ Can fetch from http://localhost:8000/health (if backend running)
✅ Git branch set to frontend-dev
```

---

### Week-Specific Frontend Requirements

**Week 1 (Login):**
- ✅ Fetch API working
- ✅ POST request to /auth/login successful
- ✅ JWT stored in localStorage
- ✅ Redirect after login functional

**Week 2 (WebSocket):**
- ✅ WebSocket API tested in browser console
- ✅ `new WebSocket("ws://...")` connects
- ✅ Messages received and logged

**Week 3 (Real-time Updates):**
- ✅ DOM manipulation working (appendChild, innerHTML)
- ✅ Dynamic table rows created
- ✅ Event listeners functional

**Week 5 (Screenshots):**
- ✅ Image display from base64
- ✅ Modal for screenshot viewing
- ✅ Lazy loading implemented

---

### Common Frontend Issues & Solutions

**Issue: "npm: command not found"**
```bash
# Reinstall Node.js from nodejs.org
# Ensure "Add to PATH" is checked during install
```

**Issue: "live-server not found"**
```bash
# Install globally
npm install -g live-server

# Or use npx
npx live-server public
```

**Issue: "CORS error when calling backend"**
```javascript
// Backend needs to enable CORS in FastAPI
// app.add_middleware(CORSMiddleware, allow_origins=["*"])
```

**Issue: "localhost:8000 refused connection"**
```bash
# Ensure backend server is running
cd backend
uvicorn app.main:app --reload
```

---

## 🤖 MANDATORY AI PROMPT FOR PHASE 0

### When Starting Phase 0

**Upload these files to AI:**
```
1. PHASE_0.md (this file)
2. ARCHITECTURE.md
3. API_CONTRACT.md
4. WEEK_OBJECTIVES.md (your role + current week)
```

**Then paste this prompt:**

```
You are acting as a senior DevOps and software setup engineer.

I am starting development for:
ROLE: [Backend / Desktop / Frontend]
CURRENT WEEK: [1 / 2 / 3 / 4 / 5 / 6]
OPERATING SYSTEM: [Windows / Mac / Linux]

Your task:
1) Validate that my environment setup matches PHASE_0.md requirements for this role and week
2) Identify any missing dependencies or software
3) Suggest version locking if necessary
4) Guide me step-by-step through the validation checklist
5) Verify each command output I provide
6) Do NOT generate any feature code yet
7) Focus strictly on environment validation and preparation

Work incrementally:
- Ask me to run ONE command at a time
- Wait for my output before proceeding
- Verify each step is successful
- Stop if any errors occur and help me fix them

After all validations pass, confirm I am ready for Week [X] development.
```

---

## ✅ PHASE 0 COMPLETION CRITERIA

### Backend Developer Ready When:
```
✅ Python 3.11+ installed and verified
✅ Virtual environment created and activated
✅ All Week-appropriate packages installed
✅ FastAPI server runs and Swagger UI loads
✅ Database connection tested (if Week 3+)
✅ .env file created with SECRET_KEY
✅ Git branch is backend-dev
✅ requirements.txt exists and is up-to-date
```

### Desktop Developer Ready When:
```
✅ .NET 8 SDK installed and verified
✅ Visual Studio 2022 installed
✅ Windows Forms project created
✅ Project builds with 0 errors
✅ NuGet packages installed (Newtonsoft.Json)
✅ Folder structure created
✅ ApiClient test compiles
✅ Git branch is desktop-dev
```

### Frontend Developer Ready When:
```
✅ Node.js 18+ installed and verified
✅ npm working correctly
✅ package.json created
✅ live-server installed
✅ Project structure created
✅ index.html loads in browser
✅ npm start works without errors
✅ Can call backend API (CORS working)
✅ Git branch is frontend-dev
```

---

## 🚫 STRICT RULES

### MUST DO:
- ✅ Complete ALL validation steps for your role
- ✅ Verify EVERY command output
- ✅ Fix ALL errors before proceeding
- ✅ Create personal Git branch
- ✅ Test basic functionality (server/build/page load)

### NEVER DO:
- ❌ Skip validation steps
- ❌ Proceed with errors present
- ❌ Start Week 1 development before Phase 0 complete
- ❌ Commit to main branch
- ❌ Use wrong package versions

---

## 📞 NEED HELP?

### If validation fails:
1. Copy exact error message
2. Note which step failed
3. Provide to team lead or search documentation
4. Do NOT proceed until resolved

### If software won't install:
1. Check system requirements
2. Verify admin/sudo privileges
3. Check firewall/antivirus
4. Try alternative installation method

---

## 🎯 NEXT STEPS AFTER PHASE 0

Once Phase 0 is complete:

1. **Read** `WEEK_OBJECTIVES.md` for your role and Week 1
2. **Upload** to AI:
   - AI_PROJECT_CONTEXT.md
   - ARCHITECTURE.md
   - API_CONTRACT.md
   - WEEK_OBJECTIVES.md (Week 1 section)
   - AI_IMPLEMENTATION_GUIDE.md
3. **Paste** `02_STARTING_WEEK_PROMPT.md`
4. **Start** Week 1 development

---

**END OF PHASE_0.md**

*Environment setup is the foundation. Do it right, develop with confidence.* 🚀

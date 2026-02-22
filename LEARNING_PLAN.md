# 📚 LEARNING PLAN - 6 DAYS PRE-PROJECT PREPARATION

## 🎯 PURPOSE

This document outlines the learning roadmap for the first 6 days before starting the 6-week Exam Monitoring System project. Each team member should focus on their role-specific technologies while everyone learns the networking fundamentals together on Day 1.

---

## 📊 TECHNOLOGY MATRIX

| Topic | Backend | Desktop | Frontend |
|-------|---------|---------|----------|
| **REST** | ✅ | ✅ | ✅ |
| **WebSocket** | ✅ | ✅ | ✅ |
| **JWT** | 🔥 Deep | Basic idea | Basic idea |
| **Async C#** | ❌ | 🔥 Deep | ❌ |
| **Async JS** | ❌ | ❌ | 🔥 Deep |
| **FastAPI** | 🔥 Deep | ❌ | ❌ |
| **WinForms** | ❌ | 🔥 Deep | ❌ |

**Legend:**
- 🔥 = Must understand deeply
- ✅ = Basic understanding required
- ❌ = Not necessary for this role

---

## 📅 SCHEDULE OVERVIEW

- **Day 1 (All Together):** REST basics, WebSocket basics
- **Day 2:** Split learning by role
- **Day 3:** Split learning by role
- **Day 4:** 👉 Start coding login system

---

## 🧠 DAY 1 — ALL TEAM (Common Foundation)

### 🔹 Networking & Web Basics (Everyone)

**Must Understand:**

1. **What is HTTP**
   - Client-server architecture
   - Request/Response model

2. **Client vs Server**
   - Link: https://www.youtube.com/watch?v=ve82kSSj_Hs

3. **Request / Response structure**
   - Headers, Body, Status codes
   - Link 1: https://www.youtube.com/watch?v=-Zea7GB2OwA
   - Link 2: https://www.youtube.com/watch?v=pi4gaFDBtMc

4. **GET vs POST vs PUT vs DELETE**
   - CRUD operations
   - When to use each method

5. **Status codes (200, 401, 403, 500)**
   - Success (2xx)
   - Client errors (4xx)
   - Server errors (5xx)

6. **JSON structure**
   - Objects and arrays
   - Key-value pairs
   - **Note:** Similar to dictionaries in Python or lists

7. **What is REST API**
   - Representational State Transfer
   - Stateless communication
   - Link: https://www.youtube.com/watch?v=qbLc5a9jdXo

8. **What is WebSocket (persistent connection vs HTTP)**
   - Real-time bidirectional communication
   - Keeps connection open
   - Use case: Live updates, chat, monitoring

---

## 👑 BACKEND DEV

---

### 🗓 DAY 2 — Python & Backend Foundations

**Python Fundamentals (If not fully comfortable):**

1. Variables
2. Conditions (if / else)
3. Loops (for, while)
4. Functions
5. Classes (OOP basics)
6. Lists & Dictionaries
7. Exception handling (try/except)

**Note:** If you already know this well → quick review only.

---

### 🗓 DAY 3 — Async + FastAPI Core

**Must Learn:**

1. **What is async programming**
   - Non-blocking operations
   - Concurrent execution

2. **async / await in Python**
   - Async functions
   - Awaiting results

3. **Why async matters in web servers**
   - Handle multiple requests simultaneously
   - Better performance

4. **FastAPI basics:**
   - Create API instance
   - Define routes (`@app.get`, `@app.post`)
   - Request body with Pydantic models
   - Query parameters
   - Returning JSON
   - HTTP status codes

---

### 🗓 DAY 4 — Authentication & Security

**Must Learn:**

1. **JWT structure (header, payload, signature)**
   - What JWT is
   - How it works
   - Why it's secure

2. **How login flow works**
   - User sends credentials
   - Server validates
   - Server returns JWT
   - Client includes JWT in future requests

3. **Password hashing (bcrypt)**
   - Never store plain text passwords
   - One-way encryption

4. **Role-based access control**
   - Student vs Instructor roles
   - Protecting endpoints by role

5. **Middleware concept**
   - Code that runs before route handlers
   - JWT validation

6. **CORS basics**
   - Cross-Origin Resource Sharing
   - Allowing frontend to call backend

**This is critical for your exam monitoring system.**

---

### 🗓 DAY 5 — WebSocket in FastAPI

**Must Learn:**

1. **Creating WebSocket endpoint**
   - `@app.websocket("/ws")`
   - Connection handling

2. **Managing connected clients**
   - Tracking active connections
   - Storing client references

3. **Broadcasting messages**
   - Sending to all connected clients
   - Sending to specific clients

4. **Handling disconnects**
   - Cleanup when client drops
   - Graceful error handling

5. **Async loops for monitoring**
   - Background tasks
   - Periodic updates

---

### 🗓 DAY 6 — Database Basics

**Must Learn:**

1. **What is a relational database**
   - Tables and rows
   - Structured data

2. **Tables & relations**
   - One-to-many relationships
   - Many-to-many relationships

3. **Primary key / Foreign key**
   - Unique identifiers
   - References between tables

4. **Basic SQL:**
   - SELECT (read)
   - INSERT (create)
   - UPDATE (modify)
   - DELETE (remove)

5. **ORMs (basic idea)**
   - Object-Relational Mapping
   - SQLAlchemy overview

---

## 🖥 DESKTOP DEV (C# / WinForms)

---

### 🗓 DAY 2 — C# Foundations

**Must Learn:**

1. Variables & types (int, string, bool)
2. if / else
3. switch statements
4. for loop
5. while loop
6. Methods (functions)
7. Classes
8. Properties (get/set)
9. Basic OOP (encapsulation)
10. Lists (List<T>)
11. Exception handling (try/catch)

**No strong C# = project collapses.**

---

### 🗓 DAY 3 — WinForms Basics

**Must Learn:**

1. **Forms**
   - Creating windows
   - Form properties

2. **Buttons**
   - Adding to form
   - Click events

3. **TextBoxes**
   - Input fields
   - Getting/setting text

4. **Event handling (button click)**
   - Event handlers
   - void ButtonName_Click(object sender, EventArgs e)

5. **MessageBox**
   - Displaying alerts
   - MessageBox.Show()

6. **Layout basics**
   - Positioning controls
   - Anchoring and docking

7. **Thread vs UI thread concept**
   - UI freezing
   - Background work

---

### 🗓 DAY 4 — HTTP in C#

**Must Learn:**

1. **HttpClient**
   - Creating client
   - Making requests

2. **Sending GET request**
   - await client.GetAsync(url)
   - Reading response

3. **Sending POST with JSON**
   - StringContent
   - JSON serialization

4. **Serializing/deserializing JSON**
   - JsonSerializer.Serialize()
   - JsonSerializer.Deserialize<T>()

5. **Handling API responses**
   - Status codes
   - Error handling

---

### 🗓 DAY 5 — Async in C#

**Must Learn:**

1. **async / await**
   - Async methods
   - Returning Task<T>

2. **Task**
   - Task.Run()
   - Task<T>

3. **Avoid blocking UI thread**
   - Don't use .Result or .Wait()
   - Use async all the way

4. **Background tasks**
   - Running work without freezing UI
   - Task.Run() for CPU-bound work

5. **Timers**
   - System.Timers.Timer
   - Periodic execution

---

### 🗓 DAY 6 — System Monitoring Basics

**Must Learn:**

1. **Process.GetProcesses()**
   - Getting all running processes
   - Process.ProcessName

2. **Detect running applications**
   - Checking if specific app is running
   - LINQ queries on processes

3. **Checking active window**
   - Win32 API basics
   - GetForegroundWindow()

4. **Basic file system access**
   - File.ReadAllText()
   - File.WriteAllText()

5. **Working with events**
   - Event handlers
   - Custom events

**This is where your real exam monitoring logic starts.**

---

## 🌐 FRONTEND DEV (Web Dashboard)

---

### 🗓 DAY 2 — JavaScript Foundations

**Must Learn:**

1. **Variables (let/const)**
   - Block scoping
   - Const for constants

2. **Functions**
   - function declarations
   - function expressions

3. **Arrow functions**
   - () => {}
   - Implicit returns

4. **if / else**
   - Conditional logic

5. **Loops**
   - for, while, forEach

6. **Arrays**
   - [], push(), pop(), map(), filter()

7. **Objects**
   - {}, key-value pairs

8. **Basic DOM manipulation**
   - document.getElementById()
   - element.innerHTML
   - element.textContent

9. **Event listeners**
   - addEventListener('click', ...)
   - Event handling

---

### 🗓 DAY 3 — Async JS

**Must Learn:**

1. **Promises**
   - .then() and .catch()
   - Promise chains

2. **async / await**
   - Async functions
   - Cleaner syntax

3. **fetch()**
   - Making HTTP requests
   - GET and POST

4. **Handling API responses**
   - response.json()
   - Status checking

5. **Error handling**
   - try/catch
   - Error messages

---

### 🗓 DAY 4 — WebSocket in JS

**Must Learn:**

1. **Creating WebSocket connection**
   - new WebSocket(url)
   - Connection events

2. **Sending messages**
   - ws.send(JSON.stringify(data))

3. **Listening to events**
   - onmessage
   - onopen, onclose, onerror

4. **Updating UI dynamically**
   - Parsing JSON messages
   - Updating DOM in real-time

---

### 🗓 DAY 5 — UI Logic

**Must Learn:**

1. **Updating table dynamically**
   - Creating table rows
   - Inserting into DOM

2. **Rendering student status**
   - Color coding (online/offline)
   - Status indicators

3. **Simple dashboard layout**
   - HTML structure
   - CSS styling basics

4. **Filtering / searching data**
   - Array.filter()
   - Search input handling

---

### 🗓 DAY 6 — Basic Security Awareness

**Must Learn:**

1. **JWT storage (localStorage vs memory)**
   - localStorage persistence
   - Security implications

2. **Protected routes**
   - Checking if user is logged in
   - Redirecting to login

3. **Token expiration handling**
   - Checking exp claim
   - Auto-logout

4. **Basic role-based UI rendering**
   - Show/hide based on role
   - Student vs Instructor views

---

## ✅ READINESS CHECKLIST

Before starting Day 1 of the 6-week project, you should be able to answer YES to:

### Backend Developer:
- [ ] Can create a FastAPI app with routes
- [ ] Can use async/await in Python
- [ ] Understand JWT authentication flow
- [ ] Can create WebSocket endpoints
- [ ] Understand basic database concepts

### Desktop Developer:
- [ ] Can create WinForms application with buttons
- [ ] Can use async/await in C#
- [ ] Can make HTTP requests with HttpClient
- [ ] Can detect running processes
- [ ] Understand basic threading concepts

### Frontend Developer:
- [ ] Can use fetch() to call APIs
- [ ] Can use async/await in JavaScript
- [ ] Can create WebSocket connections
- [ ] Can update DOM dynamically
- [ ] Understand basic JWT storage

---

## 🚀 AFTER DAY 6

You're ready to start **Week 1 - Authentication Foundation** of the main 6-week project!

Follow the objectives in `WEEK_OBJECTIVES.md` and use the AI workflow defined in `README.md`.

Good luck! 🎯

# 🤖 AI DEVELOPMENT PROTOCOL (MANDATORY)

**Project:** Exam Monitoring System

This project uses **structured AI-assisted development**.

All team members must strictly follow the protocol below when working with AI tools (ChatGPT, Copilot Chat, Claude, etc.).

---

## ⚠️ WHY THIS MATTERS

Failure to follow this structure may cause:
- ❌ Architecture drift
- ❌ API mismatches
- ❌ Integration failures
- ❌ Security vulnerabilities
- ❌ Week 6 advanced features (Inspection/Control) instability

---

## 📁 REQUIRED PROJECT DOCUMENTS

These core documents define the system:

| Document | Purpose |
|----------|---------|
| `AI_PROJECT_CONTEXT.md` | Complete project overview and context |
| `ARCHITECTURE.md` | System architecture and design patterns |
| `API_CONTRACT.md` | API endpoints, request/response formats |
| `USE_CASES.md` | User stories and system behaviors |
| `WEEK_OBJECTIVES.md` | Weekly goals for each role |
| `AI_IMPLEMENTATION_GUIDE.md` | Code templates, schemas, rules for AI |
| `PHASE_0.md` | Initial setup and prerequisites (if applicable) |

> **These documents are the single source of truth.**

### 🆕 **NEW: AI_IMPLEMENTATION_GUIDE.md**

This document contains:
- Exact code templates (Python, C#, JavaScript)
- Complete SQL database schemas (including Week 6 session tables)
- Decision trees for logic flows
- Risk score calculation algorithm
- Screenshot capture implementation
- Screen streaming implementation (Week 6)
- Remote control command execution (Week 6)
- WebSocket connection patterns
- Validation checklists
- Common mistakes to avoid

**IMPORTANT:** Always include `AI_IMPLEMENTATION_GUIDE.md` when uploading documents to AI during coding sessions. It ensures AI generates code that matches your architecture exactly.

---

## 🗂 AI PROMPT FILES (Located in `/ai-prompts/`)

| File | When to Use |
|------|-------------|
| `01_FIRST_DAY_PROMPT.md` | Day 1 setup only |
| `02_STARTING_WEEK_PROMPT.md` | Start of every week |
| `03_STARTING_SESSION_PROMPT.md` | Every development session |
| `04_DEBUG_PROMPT.md` | When debugging issues |
| `05_REVIEW_PROMPT.md` | End of week review |

> ⚠️ **No custom prompts allowed. No freestyle prompting.**

---

## 📌 1️⃣ DAY 1 — INITIAL SETUP (MANDATORY BEFORE WEEK 1)

### 📂 Upload These Files to AI:
- `AI_PROJECT_CONTEXT.md`
- `ARCHITECTURE.md`
- `API_CONTRACT.md`
- `USE_CASES.md`
- `WEEK_OBJECTIVES.md`
- `AI_IMPLEMENTATION_GUIDE.md`
- `PHASE_0.md` (if applicable)

### 📝 Then Paste:
```
01_FIRST_DAY_PROMPT.md
```

### 🎯 Objective:
- ✅ Validate environment setup
- ✅ Install correct dependencies
- ✅ Confirm readiness for Week 1
- ❌ Do NOT generate feature code

> **⚠️ You may NOT start development before completing this step.**

---

## 📌 2️⃣ START OF EVERY NEW WEEK

### 📂 Upload:
- `AI_PROJECT_CONTEXT.md`
- `ARCHITECTURE.md`
- `API_CONTRACT.md`
- `WEEK_OBJECTIVES.md` (ONLY your role + current week section)
- `AI_IMPLEMENTATION_GUIDE.md`

### 📝 Then Paste:
```
02_STARTING_WEEK_PROMPT.md
```

### 🎯 Objective:
- ✅ Break down weekly objectives
- ✅ Identify risks
- ✅ Plan implementation order
- ✅ Identify integration points
- ❌ Do NOT jump directly into coding

---

## 📌 3️⃣ START OF EVERY WORKING SESSION (DAILY DEVELOPMENT)

**Before writing code in any session:**

### 📂 Upload:
- `AI_IMPLEMENTATION_GUIDE.md` **ALWAYS include this first**
- Relevant section of `WEEK_OBJECTIVES.md`
- The exact file(s) you are modifying (e.g., `auth_routes.py`, `WebSocketClient.cs`, `dashboard.js`)
- Relevant section of `API_CONTRACT.md` (if endpoint-related)
- Relevant section of `ARCHITECTURE.md` (if structural work)

### 📝 Then Paste:
```
03_STARTING_SESSION_PROMPT.md
```

### 🎯 Objective:
- ✅ Implement ONE feature incrementally
- ✅ Respect architecture
- ✅ Respect API contract
- ✅ Work step-by-step
- ❌ Avoid full-system generation

> **AI must generate ONE step at a time and wait for confirmation.**

### 💡 Pro Tip:
Tell AI explicitly: *"Follow the code templates in AI_IMPLEMENTATION_GUIDE.md"* - This ensures generated code matches your exact patterns (JWT, screenshots, WebSocket, etc.).

---

## 📌 4️⃣ WHEN DEBUGGING

**If something fails:**

### 📂 Upload:
- `AI_IMPLEMENTATION_GUIDE.md` (helps AI understand expected patterns)
- The file that throws the error
- The related file(s)
- The exact error message
- The full stack trace
- Relevant section of `API_CONTRACT.md`
- Clearly state your **ROLE** and **CURRENT WEEK**

### 📝 Then Paste:
```
04_DEBUG_PROMPT.md
```

### 🎯 Objective:
- ✅ Identify root cause
- ✅ Provide minimal fix
- ❌ Avoid rewriting modules
- ✅ Ensure contract compliance

> **❌ Never say "it doesn't work" without the error.**

---

## 📌 5️⃣ END OF WEEK REVIEW (RECOMMENDED)

**At the end of each week:**

### 📂 Upload:
- `AI_IMPLEMENTATION_GUIDE.md` (for validation checklists)
- Main files developed during the week

### 📝 Then Paste:
```
05_REVIEW_PROMPT.md
```

### 🎯 Objective:
- ✅ Validate architecture compliance
- ✅ Detect security risks
- ✅ Detect async/threading issues
- ✅ Improve maintainability
- ✅ Check against implementation guide standards

---

## 🚫 STRICT RULES

| ❌ NEVER | ✅ ALWAYS |
|----------|-----------|
| Upload the entire project unless performing integration | Work incrementally |
| Modify API structures without updating `API_CONTRACT.md` | Update documentation with code |
| Redesign architecture without updating `ARCHITECTURE.md` | Follow architectural decisions |
| Skip weekly planning | Plan before coding |
| Generate the entire system in one prompt | Generate step-by-step |
| Use freestyle prompts | Use structured prompts from `/ai-prompts/` |
| Block monitoring loop with screenshot/streaming | Keep all capture operations async/non-blocking |
| Add admin password to Interactive Mode | Follow COOPERATIVE model (trust-based) |

---

## 🧠 AI USAGE PRINCIPLES

### AI is context-sensitive:

| Context Quality | Output Quality |
|-----------------|----------------|
| Too much context | Generic output |
| Too little context | Wrong assumptions |
| Unstructured prompts | Architectural damage |
| **Structured protocol** | **Clean, predictable output** |

### This protocol ensures:
- ✅ **Stability** — No architectural drift
- ✅ **Discipline** — Structured development
- ✅ **Predictable output** — Consistent code quality
- ✅ **Clean Week 6 integration** — All components work together

---

## 📊 PROTOCOL WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                         DAY 1                                │
│  Upload: All Core Docs → Paste: 01_FIRST_DAY_PROMPT.md     │
│  Result: Environment Setup Complete                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     START OF WEEK N                          │
│  Upload: Core Docs + Week N Objectives                       │
│  Paste: 02_STARTING_WEEK_PROMPT.md                          │
│  Result: Weekly Implementation Plan                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  DAILY DEVELOPMENT SESSION                   │
│  Upload: Current Files + Relevant Docs                       │
│  Paste: 03_STARTING_SESSION_PROMPT.md                       │
│  Result: Incremental Feature Implementation                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    │   Issue Found?    │
                    └─────────┬─────────┘
                              ↓
                        YES ─────→ Upload: Error Files + Stack Trace
                                   Paste: 04_DEBUG_PROMPT.md
                                   Result: Targeted Fix
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      END OF WEEK                             │
│  Upload: Week's Files → Paste: 05_REVIEW_PROMPT.md         │
│  Result: Quality Assurance & Refactoring                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 QUICK REFERENCE CHECKLIST

### ✅ Before ANY AI Interaction:

- [ ] Identified which prompt file to use
- [ ] Gathered all required documents
- [ ] Prepared specific files (not entire project)
- [ ] Noted current role and week
- [ ] Have clear objective for this session

### ✅ During Development:

- [ ] Working on ONE feature at a time
- [ ] Following architecture patterns
- [ ] Respecting API contract
- [ ] Testing incrementally
- [ ] Committing small changes

### ✅ After Feature Completion:

- [ ] Code tested and working
- [ ] Documentation updated if needed
- [ ] Git commit with proper message
- [ ] Ready for PR (if end of feature)

---

## 🎯 ROLE-SPECIFIC GUIDELINES

### Backend Developer
- Focus on `/backend` folder
- Always reference `API_CONTRACT.md` for endpoints
- Update API contract if adding new endpoints
- Test with Postman/Thunder Client before committing
- Week 6: Implement session management (Inspection/Control)
- Week 6: Implement WebSocket frame relay logic
- Week 6: Enforce one-at-a-time session constraints

### Desktop Developer
- Focus on `/desktop` folder
- Reference `API_CONTRACT.md` for API consumption
- Follow C# async/await patterns from `ARCHITECTURE.md`
- Test process monitoring on actual system
- Week 6: Implement screen streaming (5 FPS, non-blocking)
- Week 6: Implement remote command execution (COOPERATIVE model)
- Week 6: Test emergency stop (CTRL+ALT+SHIFT+E)

### Frontend Developer
- Focus on `/frontend` folder
- Reference `API_CONTRACT.md` for API calls
- Follow React patterns from `ARCHITECTURE.md`
- Test UI in browser before committing
- Week 6: Implement live stream viewer (decode/render frames)
- Week 6: Implement remote control interface (canvas-based)
- Week 6: Enforce one-at-a-time UI constraints

---

## 🔒 FINAL RULE

> **If you do not follow this protocol, you are not working on the project — you are gambling with it.**

---

## 📞 SUPPORT

### Having Issues?
1. Check this README
2. Verify you're using the correct prompt file
3. Ensure all required documents are uploaded
4. Ask team lead for clarification

### Document Conflicts?
If you notice inconsistencies between documents:
1. Stop development
2. Report to team lead
3. Wait for clarification
4. Do NOT guess or improvise

---

## 📝 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial protocol established |
| 1.1 | Feb 2026 | Added AI_IMPLEMENTATION_GUIDE.md with code templates |
| 2.0 | Feb 2026 | Week 6 complete specification (Inspection Mode + Interactive Mode COOPERATIVE model) |

---

## 📚 UNDERSTANDING YOUR DOCUMENTATION

Your project has **two types of documentation**:

### **Protocol & Process Documents:**
- `README.md` (this file) - How to work with AI
- `GIT_WORKFLOW.md` - How to use Git
- `HOW_TO_USE_WITH_AI.md` - Guide to all documentation

### **Technical Specification Documents:**
- `AI_PROJECT_CONTEXT.md` - What you're building
- `ARCHITECTURE.md` - How it's structured
- `API_CONTRACT.md` - Exact API formats
- `USE_CASES.md` - How it behaves
- `WEEK_OBJECTIVES.md` - Implementation timeline
- `AI_IMPLEMENTATION_GUIDE.md` - Code templates for AI

**Read protocol documents once. Reference technical documents constantly.**

---

## 📚 ADDITIONAL RESOURCES

- [How to Use This Documentation with AI](./HOW_TO_USE_WITH_AI.md)
- [Git Workflow Documentation](./GIT_WORKFLOW.md)
- [Project Context](./AI_PROJECT_CONTEXT.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [API Contract](./API_CONTRACT.md)
- [AI Implementation Guide](./AI_IMPLEMENTATION_GUIDE.md)

---

**Remember:** Structure = Stability. Follow the protocol, deliver quality.

---

*Last Updated: February 2026 - v2.0 (Week 6 Complete)*

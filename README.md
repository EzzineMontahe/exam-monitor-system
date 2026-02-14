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
- ❌ Week 4+ instability

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
| `PHASE_0.md` | Initial setup and prerequisites |

> **These documents are the single source of truth.**

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
- `PHASE_0.md`

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

---

## 📌 4️⃣ WHEN DEBUGGING

**If something fails:**

### 📂 Upload:
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

### Desktop Developer
- Focus on `/desktop` folder
- Reference `API_CONTRACT.md` for API consumption
- Follow C# async/await patterns from `ARCHITECTURE.md`
- Test process monitoring on actual system

### Frontend Developer
- Focus on `/frontend` folder
- Reference `API_CONTRACT.md` for API calls
- Follow React patterns from `ARCHITECTURE.md`
- Test UI in browser before committing

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

---

## 📚 ADDITIONAL RESOURCES

- [Git Workflow Documentation](./GIT_WORKFLOW.md)
- [Project Context](./AI_PROJECT_CONTEXT.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [API Contract](./API_CONTRACT.md)

---

**Remember:** Structure = Stability. Follow the protocol, deliver quality.

---

*Last Updated: February 2026*

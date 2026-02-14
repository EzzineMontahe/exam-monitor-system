🤖 AI DEVELOPMENT PROTOCOL (MANDATORY)

This project uses structured AI-assisted development.

All team members must strictly follow the protocol below when working with AI tools (ChatGPT, Copilot Chat, etc.).

Failure to follow this structure may cause:

Architecture drift

API mismatches

Integration failures

Security vulnerabilities

Week 4+ instability

📁 REQUIRED PROJECT DOCUMENTS

These core documents define the system:

AI_PROJECT_CONTEXT.md

ARCHITECTURE.md

API_CONTRACT.md

USE_CASES.md

WEEK_OBJECTIVES.md

PHASE_0.md

These documents are the single source of truth.

🗂 AI PROMPT FILES (Located in /ai-prompts/)

01_FIRST_DAY_PROMPT.md

02_STARTING_WEEK_PROMPT.md

03_STARTING_SESSION_PROMPT.md

04_DEBUG_PROMPT.md

05_REVIEW_PROMPT.md

No custom prompts allowed.
No freestyle prompting.

📌 1️⃣ DAY 1 — INITIAL SETUP (MANDATORY BEFORE WEEK 1)
📂 Upload These Files to AI:

AI_PROJECT_CONTEXT.md

ARCHITECTURE.md

API_CONTRACT.md

USE_CASES.md

WEEK_OBJECTIVES.md

PHASE_0.md

📝 Then Paste:

01_FIRST_DAY_PROMPT.md

🎯 Objective:

Validate environment setup

Install correct dependencies

Confirm readiness for Week 1

Do NOT generate feature code

You may NOT start development before completing this step.

📌 2️⃣ START OF EVERY NEW WEEK
📂 Upload:

AI_PROJECT_CONTEXT.md

ARCHITECTURE.md

API_CONTRACT.md

WEEK_OBJECTIVES.md (ONLY your role + current week section)

📝 Then Paste:

02_STARTING_WEEK_PROMPT.md

🎯 Objective:

Break down weekly objectives

Identify risks

Plan implementation order

Identify integration points

Do NOT jump directly into coding.

📌 3️⃣ START OF EVERY WORKING SESSION (DAILY DEVELOPMENT)

Before writing code in any session:

📂 Upload:

Relevant section of WEEK_OBJECTIVES.md

The exact file(s) you are modifying (e.g. auth_routes.py, WebSocketClient.cs, dashboard.js)

Relevant section of API_CONTRACT.md (if endpoint-related)

Relevant section of ARCHITECTURE.md (if structural work)

📝 Then Paste:

03_STARTING_SESSION_PROMPT.md

🎯 Objective:

Implement ONE feature incrementally

Respect architecture

Respect API contract

Work step-by-step

Avoid full-system generation

AI must generate ONE step at a time and wait for confirmation.

📌 4️⃣ WHEN DEBUGGING

If something fails:

📂 Upload:

The file that throws the error

The related file(s)

The exact error message

The full stack trace

Relevant section of API_CONTRACT.md

Clearly state your ROLE and CURRENT WEEK

📝 Then Paste:

04_DEBUG_PROMPT.md

🎯 Objective:

Identify root cause

Provide minimal fix

Avoid rewriting modules

Ensure contract compliance

Never say “it doesn’t work” without the error.

📌 5️⃣ END OF WEEK REVIEW (RECOMMENDED)

At the end of each week:

📂 Upload:

Main files developed during the week

📝 Then Paste:

05_REVIEW_PROMPT.md

🎯 Objective:

Validate architecture compliance

Detect security risks

Detect async/threading issues

Improve maintainability

🚫 STRICT RULES

Never upload the entire project unless performing integration.

Never modify API structures without updating API_CONTRACT.md.

Never redesign architecture without updating ARCHITECTURE.md.

Never skip weekly planning.

Never generate the entire system in one prompt.

Always work incrementally.

🧠 AI USAGE PRINCIPLES

AI is context-sensitive.

Too much context → generic output
Too little context → wrong assumptions
Unstructured prompts → architectural damage

This protocol ensures:

Stability

Discipline

Predictable output

Clean Week 6 integration

🔒 FINAL RULE

If you do not follow this protocol,
you are not working on the project —
you are gambling with it.
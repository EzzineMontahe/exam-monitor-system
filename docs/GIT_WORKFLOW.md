# GIT WORKFLOW (MANDATORY FOR ALL TEAM MEMBERS)

Project: Exam Monitoring System

This document defines how Git must be used.
No freestyle.
No pushing directly to main.

------------------------------------------------------------
0️⃣ IMPORTANT RULES
------------------------------------------------------------

❌ Never push directly to main.
❌ Never work without pulling latest changes.
❌ Never commit unfinished broken code.
❌ Never delete someone else's files.

✅ Always create your own branch.
✅ Always pull before starting work.
✅ Always open a Pull Request (PR).
✅ Always test before pushing.

------------------------------------------------------------
1️⃣ FIRST TIME SETUP (ONE TIME ONLY)
------------------------------------------------------------

Clone repository:

    git clone https://github.com/ghassendebbich/exam-monitor-system.git
    cd exam-monitor-system

Check remote:

    git remote -v

Create your personal branch:

Backend Developer:
    git checkout -b backend-dev

Desktop Developer:
    git checkout -b desktop-dev

Frontend Developer:
    git checkout -b frontend-dev

Push your branch:

    git push -u origin backend-dev
    git push -u origin desktop-dev
    git push -u origin frontend-dev

Now you always work inside your branch.

------------------------------------------------------------
2️⃣ EVERY TIME YOU START WORKING
------------------------------------------------------------

Step 1: Go to project folder

    cd exam-monitor-system

Step 2: Switch to your branch

    git checkout backend-dev
    (or desktop-dev / frontend-dev)

Step 3: Pull latest updates from main

    git checkout main
    git pull origin main

Step 4: Go back to your branch

    git checkout backend-dev

Step 5: Merge main into your branch

    git merge main

If there are no conflicts → continue working.

------------------------------------------------------------
3️⃣ WHEN YOU FINISH A FEATURE
------------------------------------------------------------

Step 1: Check modified files

    git status

Step 2: Add changes

    git add .

Step 3: Commit with clear message

    git commit -m "Week 1 - Implemented login endpoint"

Step 4: Push branch

    git push origin backend-dev

------------------------------------------------------------
4️⃣ OPENING A PULL REQUEST (VERY IMPORTANT)
------------------------------------------------------------

1. Go to GitHub repository.
2. Click "Compare & pull request".
3. Select:
   Base branch: main
   Compare branch: your branch
4. Add clear description:
   - What was implemented
   - What files changed
   - What was tested
5. Submit PR.
6. Wait for review before merging.

------------------------------------------------------------
5️⃣ MERGING RULE
------------------------------------------------------------

Only merge after:

- Code compiles
- No runtime errors
- AI review completed (using REVIEW_PROMPT.md)
- Teammate approves

Project leader should control merging to main.

------------------------------------------------------------
6️⃣ IF YOU GET A CONFLICT
------------------------------------------------------------

Git will show:

    CONFLICT (content): Merge conflict in filename

Open the file.
Look for:

    <<<<<<< HEAD
    your code
    =======
    other code
    >>>>>>> main

Manually fix it.
Remove conflict markers.
Then:

    git add .
    git commit -m "Resolved merge conflict"
    git push

------------------------------------------------------------
7️⃣ END OF WEEK RULE
------------------------------------------------------------

At end of each week:

- All branches must be merged into main.
- main must always be stable.
- No broken code allowed on main.

------------------------------------------------------------
8️⃣ COMMIT MESSAGE FORMAT
------------------------------------------------------------

Use this format:

Week X - Short description

Examples:

Week 1 - Added JWT authentication
Week 2 - Implemented WebSocket connection
Week 3 - Added process monitoring logic

------------------------------------------------------------
9️⃣ PROJECT STRUCTURE RULE
------------------------------------------------------------

Each role touches only their folder:

Backend → /backend
Desktop → /desktop
Frontend → /frontend

Docs updates go inside /docs

Never modify another role’s folder unless approved.

------------------------------------------------------------
10️⃣ DAILY DISCIPLINE
------------------------------------------------------------

Before coding:
    git pull origin main

After coding:
    git add .
    git commit -m "Clear message"
    git push

Never accumulate 3–4 days of uncommitted code.
Commit small, commit often.

------------------------------------------------------------
END OF DOCUMENT
------------------------------------------------------------

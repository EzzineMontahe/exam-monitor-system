✅ GitHub-Formatted Version (Proper Spacing & Rendering)
# GIT WORKFLOW (MANDATORY FOR ALL TEAM MEMBERS)

Project: Exam Monitoring System

This document defines how Git must be used.

No freestyle.  
No pushing directly to `main`.

---

## 0️⃣ IMPORTANT RULES

❌ Never push directly to `main`  
❌ Never work without pulling latest changes  
❌ Never commit unfinished broken code  
❌ Never delete someone else's files  

✅ Always create your own branch  
✅ Always pull before starting work  
✅ Always open a Pull Request (PR)  
✅ Always test before pushing  

---

## 1️⃣ FIRST TIME SETUP (ONE TIME ONLY)

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


Now you always work inside your branch.

2️⃣ EVERY TIME YOU START WORKING

Step 1: Go to project folder

cd exam-monitor-system


Step 2: Switch to your branch

git checkout backend-dev


Step 3: Pull latest updates from main

git checkout main
git pull origin main


Step 4: Go back to your branch

git checkout backend-dev


Step 5: Merge main into your branch

git merge main


If there are no conflicts → continue working.

3️⃣ WHEN YOU FINISH A FEATURE

Check modified files:

git status


Add changes:

git add .


Commit:

git commit -m "Week 1 - Implemented login endpoint"


Push:

git push origin backend-dev

4️⃣ OPENING A PULL REQUEST

Go to GitHub repository.

Click Compare & pull request.

Base branch: main

Compare branch: your branch

Add description:

What was implemented

What files changed

What was tested

Submit PR.

Wait for review before merging.

5️⃣ MERGING RULE

Only merge after:

Code compiles

No runtime errors

AI review completed (REVIEW_PROMPT.md)

Teammate approves

Project leader should control merging to main.

6️⃣ IF YOU GET A CONFLICT

Git will show:

CONFLICT (content): Merge conflict in filename


You will see:

<<<<<<< HEAD
your code
=======
other code
>>>>>>> main


Fix manually.

Remove conflict markers.

Then:

git add .
git commit -m "Resolved merge conflict"
git push

7️⃣ END OF WEEK RULE

All branches must be merged into main

main must always be stable

No broken code allowed on main

8️⃣ COMMIT MESSAGE FORMAT

Use:

Week X - Short description


Examples:

Week 1 - Added JWT authentication

Week 2 - Implemented WebSocket connection

Week 3 - Added monitoring logic

9️⃣ PROJECT STRUCTURE RULE

Each role touches only their folder:

Backend → /backend

Desktop → /desktop

Frontend → /frontend

Docs → /docs

Never modify another role’s folder unless approved.

🔟 DAILY DISCIPLINE

Before coding:

git pull origin main


After coding:

git add .
git commit -m "Clear message"
git push


Commit small.
Commit often.
Never accumulate days of uncommitted work.


---

# 🔎 Why This Version Renders Correctly

- Proper Markdown headings (`##`)
- Blank lines between sections
- Proper fenced code blocks
- No broken inline formatting
- No indentation mistakes

---

If you want, I can now generate a **simplified ultra-beginner version** (like a cheat sheet) that your teammates can print and follow without thinking.
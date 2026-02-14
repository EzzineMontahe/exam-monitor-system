# GIT WORKFLOW (MANDATORY FOR ALL TEAM MEMBERS)

**Project:** Exam Monitoring System

This document defines how Git must be used. No freestyle. No pushing directly to main.

---

## 0️⃣ IMPORTANT RULES

### ❌ NEVER DO THIS:
- Never push directly to `main`
- Never work without pulling latest changes
- Never commit unfinished broken code
- Never delete someone else's files

### ✅ ALWAYS DO THIS:
- Always create your own branch
- Always pull before starting work
- Always open a Pull Request (PR)
- Always test before pushing

---

## 1️⃣ FIRST TIME SETUP (ONE TIME ONLY)

### Clone repository:
```bash
git clone https://github.com/ghassendebbich/exam-monitor-system.git
cd exam-monitor-system
```

### Check remote:
```bash
git remote -v
```

### Create your personal branch:

**Backend Developer:**
```bash
git checkout -b backend-dev
git push -u origin backend-dev
```

**Desktop Developer:**
```bash
git checkout -b desktop-dev
git push -u origin desktop-dev
```

**Frontend Developer:**
```bash
git checkout -b frontend-dev
git push -u origin frontend-dev
```

> **Note:** Now you always work inside your branch.

---

## 2️⃣ EVERY TIME YOU START WORKING

### Step 1: Go to project folder
```bash
cd exam-monitor-system
```

### Step 2: Switch to your branch
```bash
git checkout backend-dev
# (or desktop-dev / frontend-dev)
```

### Step 3: Pull latest updates from main
```bash
git checkout main
git pull origin main
```

### Step 4: Go back to your branch
```bash
git checkout backend-dev
```

### Step 5: Merge main into your branch
```bash
git merge main
```

> If there are no conflicts → continue working.

---

## 3️⃣ WHEN YOU FINISH A FEATURE

### Step 1: Check modified files
```bash
git status
```

### Step 2: Add changes
```bash
git add .
```

### Step 3: Commit with clear message
```bash
git commit -m "Week 1 - Implemented login endpoint"
```

### Step 4: Push branch
```bash
git push origin backend-dev
```

---

## 4️⃣ OPENING A PULL REQUEST (VERY IMPORTANT)

1. Go to **GitHub repository**
2. Click **"Compare & pull request"**
3. Select:
   - **Base branch:** `main`
   - **Compare branch:** your branch
4. Add clear description:
   - What was implemented
   - What files changed
   - What was tested
5. **Submit PR**
6. **Wait for review** before merging

---

## 5️⃣ MERGING RULE

### Only merge after:
- ✅ Code compiles
- ✅ No runtime errors
- ✅ AI review completed (using `REVIEW_PROMPT.md`)
- ✅ Teammate approves

> **Project leader** should control merging to `main`.

---

## 6️⃣ IF YOU GET A CONFLICT

Git will show:
```
CONFLICT (content): Merge conflict in filename
```

### Steps to resolve:

1. Open the conflicted file
2. Look for conflict markers:
```
<<<<<<< HEAD
your code
=======
other code
>>>>>>> main
```
3. Manually fix the conflict
4. Remove conflict markers
5. Save the file

### Then commit the resolution:
```bash
git add .
git commit -m "Resolved merge conflict"
git push
```

---

## 7️⃣ END OF WEEK RULE

At the end of each week:
- ✅ All branches must be merged into `main`
- ✅ `main` must always be stable
- ❌ No broken code allowed on `main`

---

## 8️⃣ COMMIT MESSAGE FORMAT

### Use this format:
```
Week X - Short description
```

### Examples:
```bash
git commit -m "Week 1 - Added JWT authentication"
git commit -m "Week 2 - Implemented WebSocket connection"
git commit -m "Week 3 - Added process monitoring logic"
```

---

## 9️⃣ PROJECT STRUCTURE RULE

### Each role touches only their folder:

| Role | Folder |
|------|--------|
| Backend Developer | `/backend` |
| Desktop Developer | `/desktop` |
| Frontend Developer | `/frontend` |
| Documentation | `/docs` |

> ⚠️ **Never modify another role's folder unless approved.**

---

## 🔟 DAILY DISCIPLINE

### Before coding:
```bash
git pull origin main
```

### After coding:
```bash
git add .
git commit -m "Clear message"
git push
```

### ⚠️ Important:
- Never accumulate 3–4 days of uncommitted code
- **Commit small, commit often**

---

## 📋 QUICK REFERENCE CHEAT SHEET

| Action | Command |
|--------|---------|
| Check current branch | `git branch` |
| Switch to branch | `git checkout branch-name` |
| Pull latest changes | `git pull origin main` |
| Check status | `git status` |
| Stage all changes | `git add .` |
| Commit changes | `git commit -m "message"` |
| Push to remote | `git push origin branch-name` |
| View commit history | `git log --oneline` |
| Discard local changes | `git checkout -- filename` |
| View remote URL | `git remote -v` |

---

## 🆘 TROUBLESHOOTING

### Problem: "Your branch is behind origin/main"
**Solution:**
```bash
git pull origin main
```

### Problem: "fatal: not a git repository"
**Solution:**
```bash
cd exam-monitor-system
```

### Problem: Changes not showing up
**Solution:**
```bash
git status
git add .
```

### Problem: Accidentally committed to wrong branch
**Solution:**
```bash
git reset HEAD~1
git stash
git checkout correct-branch
git stash pop
```

---

## 📞 NEED HELP?

1. Check this document first
2. Ask team lead
3. Review GitHub documentation: https://docs.github.com

---

**END OF DOCUMENT**

*Last updated: February 2026*

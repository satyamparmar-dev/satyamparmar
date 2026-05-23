# Git commands every Java developer uses daily

*The commands that save you when something goes wrong — with real examples from Java project workflows. Windows, macOS, and Linux all share the same Git CLI.*

---

## Why Git mastery matters beyond `add`, `commit`, `push`

Most developers know the basics. The developers who stand out in pull request reviews, incident recovery, and refactoring work know the power commands: `stash`, `bisect`, `cherry-pick`, `rebase`, `reflog`. This post covers exactly those — one scenario, one command, one explanation of what it actually does.

---

## Everyday navigation

| Command | What it does |
|---|---|
| `git status` | Show modified, staged, and untracked files. Run this before everything else. |
| `git log --oneline --graph --decorate` | Compact visual branch history. Add `--all` to see remote branches too. |
| `git diff` | Unstaged changes vs last commit. |
| `git diff --staged` | Staged changes (what will go into the next commit). |
| `git diff main..feature/my-branch` | What my branch adds compared to `main`. |
| `git show HEAD~2` | Show what the commit two steps back changed. |

---

## Branching

```bash
# Create and switch in one step
git checkout -b feature/order-service-refactor

# Modern equivalent (Git 2.23+)
git switch -c feature/order-service-refactor

# List all branches (including remote)
git branch -a

# Delete a branch (safe — refuses if unmerged)
git branch -d feature/old-work

# Force delete (you know what you are doing)
git branch -D feature/abandoned
```

---

## Stash — save work without committing

Use stash when you need to switch context mid-task without a half-done commit.

```bash
# Stash everything (tracked changes + staged)
git stash

# Stash with a descriptive name (use this — unnamed stashes are confusing later)
git stash push -m "WIP: adding null check to OrderService"

# Stash untracked files too (new files not yet git-added)
git stash push --include-untracked -m "WIP: new PaymentController draft"

# List all stashes
git stash list
# Output: stash@{0}: WIP: adding null check to OrderService

# Apply and remove from stash list
git stash pop

# Apply but keep in stash list (safe — apply first, drop after testing)
git stash apply stash@{0}

# Drop a specific stash
git stash drop stash@{0}

# Clear all stashes (careful)
git stash clear
```

**Java team scenario:** You are halfway through a refactor in `PaymentService.java` when a P1 bug comes in. `git stash push -m "WIP: payment refactor"`, fix the bug on a new branch, merge, then `git stash pop` to continue.

---

## Cherry-pick — bring one commit from another branch

```bash
# Get the commit hash you want
git log --oneline feature/auth-fix
# a3f8c12 fix: null check on token expiry

# Apply that commit to your current branch
git cherry-pick a3f8c12

# Cherry-pick a range of commits (first..last — excludes first)
git cherry-pick a3f8c12..d9e1f45

# Cherry-pick without auto-committing (lets you review/edit first)
git cherry-pick --no-commit a3f8c12
```

**Java team scenario:** A hotfix commit on `main` fixed a critical NPE in `UserRepository`. Your long-running feature branch needs that fix now without merging all of `main`.

---

## Rebase — rewrite history cleanly

```bash
# Rebase your feature branch onto the latest main
git checkout feature/my-branch
git rebase main

# Interactive rebase — squash, reorder, reword the last N commits
git rebase -i HEAD~4

# In the editor that opens, change 'pick' to:
# squash  (s) — merge into previous commit
# reword  (r) — keep but edit commit message
# drop    (d) — delete this commit entirely
# fixup   (f) — squash into previous, discard this commit message

# If a conflict occurs during rebase:
# 1. Fix the conflict in the file
# 2. git add <resolved-file>
# 3. git rebase --continue
# (or git rebase --abort to give up and return to before the rebase)
```

**Best practice for Java teams:** Before opening a PR, `git rebase -i HEAD~N` to squash "WIP", "fix typo", and "add test" commits into one meaningful commit per feature.

---

## Bisect — find the commit that introduced a bug

This is the command most developers don't know but should. It performs a binary search through commit history to find which commit broke something.

```bash
# Start bisect session
git bisect start

# Mark the current state as broken
git bisect bad

# Mark a known-good commit (e.g. last release tag)
git bisect good v2.3.0

# Git now checks out the midpoint commit — run your test
mvn test -Dtest=OrderServiceTest
# If test fails:
git bisect bad
# If test passes:
git bisect good

# Git keeps bisecting (each step halves the search space)
# When done, Git prints: "abc1234 is the first bad commit"

# End the session (return to HEAD)
git bisect reset

# Automate with a script (runs on every candidate commit):
git bisect run mvn -q test -Dtest=OrderServiceTest
```

**Java team scenario:** A regression appeared somewhere in the last 200 commits. With bisect, you find the exact commit in 7–8 test runs (log₂200 ≈ 7.6) instead of guessing.

---

## Reflog — recover lost commits

`reflog` is your safety net. It records every time HEAD moved — even after reset, rebase, or branch deletion.

```bash
# Show the full reflog
git reflog

# Output (newest first):
# a1b2c3d HEAD@{0}: reset: moving to HEAD~2
# e4f5g6h HEAD@{1}: commit: feat: add OrderValidator
# i7j8k9l HEAD@{2}: commit: fix: null check in PaymentService

# You did git reset --hard and lost 2 commits? Recover:
git checkout -b recovery-branch e4f5g6h

# Or reset back to before the mistake:
git reset --hard e4f5g6h
```

**Rule:** Nothing is truly lost until you run `git gc`. If you can still see it in `reflog`, you can recover it.

---

## Reset — undo with control

```bash
# Undo the last commit but keep changes staged
git reset --soft HEAD~1

# Undo the last commit, keep changes as unstaged (most common)
git reset HEAD~1        # default: --mixed

# Undo the last commit AND discard all changes (destructive)
git reset --hard HEAD~1

# Unstage a file (keep changes in working tree)
git reset HEAD src/main/java/PaymentService.java
```

---

## Useful one-liners for Java projects

```bash
# See which commits touched a specific file
git log --follow --oneline src/main/java/com/example/OrderService.java

# See who last changed each line (blame)
git blame src/main/java/com/example/OrderService.java

# Find which commit deleted a method
git log -S "public void processOrder" --oneline

# Undo all local changes to one file
git checkout -- src/main/java/com/example/OrderService.java

# Stage only parts of a file interactively (hunk-by-hunk)
git add -p src/main/java/com/example/OrderService.java

# Show what would be cleaned (dry run)
git clean -n

# Actually remove untracked files (careful)
git clean -f

# Pull with rebase instead of merge (keeps linear history)
git pull --rebase origin main
```

---

## .gitignore for Java/Maven/Gradle projects

```gitignore
# Build output
target/
build/
out/

# IDE files
.idea/
*.iml
.classpath
.project
.settings/

# Gradle wrapper
!gradle/wrapper/gradle-wrapper.jar

# Environment
.env
*.env.local

# Logs
*.log
logs/

# macOS
.DS_Store
```

---

## Quick reference card

| Situation | Command |
|---|---|
| Switch context mid-task | `git stash push -m "WIP: description"` |
| Get a fix from another branch | `git cherry-pick <hash>` |
| Clean up commits before PR | `git rebase -i HEAD~N` |
| Find which commit broke the build | `git bisect start` / `bad` / `good` |
| Recover a lost commit | `git reflog` → `git checkout -b recovery <hash>` |
| Undo last commit, keep changes | `git reset HEAD~1` |
| See who changed a line | `git blame <file>` |
| Find when a method was deleted | `git log -S "methodName" --oneline` |

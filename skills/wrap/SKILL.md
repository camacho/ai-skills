---
name: wrap
description: Use when ending a session, wrapping up work, saying goodbye, or transitioning to a new task context after completing a development cycle
---

# Wrap

Session wrap-up: reflect, clean worktrees, prepare for /clear.

## 1. Reflect

Invoke `/reflect` via the Skill tool. Wait for it to complete before proceeding.

Do NOT inline reflect logic — invoke the skill. It handles MEMORY.md, Basic Memory vault, GitHub issues, plan finalization, and `.last-reflect-ts`.

## 2. Session Cleanup

After reflect completes, clean up session worktrees:

```bash
git worktree list
```

For each entry under `.worktrees/` (never the main worktree):

```bash
BRANCH=$(git -C <worktree-path> rev-parse --abbrev-ref HEAD)
git branch --merged main | grep -q "$BRANCH" && MERGED=true || MERGED=false
```

- **Merged**: `git worktree remove <path>` + `git branch -d $BRANCH`
- **Not merged**: warn with branch name, do not delete

**`.branch-context.md`**: If it exists in the main worktree and reflect confirmed learnings were consolidated, delete it. If reflect skipped it or reported no learnings, leave it and warn: ".branch-context.md may contain unreflected learnings."

**Report:**

```
Session cleanup:
  Removed: .worktrees/feat-foo (branch feat/foo, merged)
  Kept:    .worktrees/feat-baz (branch feat/baz, NOT merged)
  Cleaned: .branch-context.md (learnings consolidated)
```

## 3. Prompt /clear

> Session wrapped. Type `/clear` when ready.

Do NOT invoke /clear — it is a built-in command only the user can type. After /clear, the SessionStart hook injects catchup instructions automatically.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Inlining reflect logic | Invoke `/reflect` via Skill tool |
| Removing unmerged worktrees | Warn only — never delete unmerged work |
| Invoking /clear directly | Tell user to type it — /clear is a built-in |
| Cleaning main worktree | Only clean `.worktrees/*` entries |
| Skipping cleanup report | Always report what was cleaned/kept |
